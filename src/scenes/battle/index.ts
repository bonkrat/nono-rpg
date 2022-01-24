import sha256 from "crypto-js/sha256";
import { shuffle } from "lodash";
import Phaser from "phaser";
import {
  BattleKeys,
  CellContainer,
  CellSprite,
  MiniGrid,
  Nonogram,
  Puzzle,
  PuzzleSet,
} from "../../../types/puzzle";
import cell from "../../assets/sprites/cell.png";
import cellSelected from "../../assets/sprites/cell_selected.png";
import letters from "../../assets/sprites/letters.png";
import numbers from "../../assets/sprites/numbers.png";
import player from "../../assets/sprites/player.png";
import {
  addFontAnims,
  addText,
  buildMinigrid,
  buildPuzzle,
  checkPuzzle,
  loadFontFace,
  movePlayer,
  setCompletedRowsAndColumns,
} from "../../helpers";

const width = 800;
const height = 600;
const scale = 2;

class Battle extends Phaser.Scene {
  protected cells: CellSprite[][];
  private dragging: CellSprite[];
  protected puzzleSet: PuzzleSet;
  protected currentPuzzle: number;
  protected puzzle: Puzzle;
  protected minigrids?: MiniGrid[];
  protected player: any;
  protected keys?: BattleKeys;
  protected cellcontainer?: CellContainer;
  protected completedPuzzles: number[];
  public emitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  public buildPuzzle = buildPuzzle.bind(this);
  public checkPuzzle = checkPuzzle.bind(this);
  public setCompletedRowsAndColumns = setCompletedRowsAndColumns.bind(this);
  public buildMinigrid = buildMinigrid.bind(this);
  public movePlayer = movePlayer.bind(this);
  public loadFontFace = loadFontFace.bind(this);
  public addFontAnims = addFontAnims.bind(this);
  public addText = addText.bind(this);
  protected currentPuzzleSection = 0;
  protected rowClues?: Phaser.GameObjects.Sprite[][];
  protected colClues?: Phaser.GameObjects.Sprite[][];

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    puzzleSet: PuzzleSet
  ) {
    super(config);
    this.cells = [];
    this.dragging = []; // array of currently dragged over cells.
    this.puzzleSet = puzzleSet;
    this.currentPuzzle = 0;
    this.puzzle = this.puzzleSet[0];
    this.player = {};
    this.completedPuzzles = [];
  }

  preload() {
    [
      ["cell", cell],
      ["cellSelected", cellSelected],
      ["numbers", numbers],
      ["player", player],
      ["letters", letters],
    ].forEach(([key, url]: string[]) => {
      this.load.spritesheet(key, url, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });

    // Load the font face
    this.loadFontFace();
  }

  create() {
    // Load animations for text
    this.addFontAnims();

    // Setup keyboard controls
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      select: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as BattleKeys;

    for (var i = 0; i < 5; i++) {
      this.anims.create({
        key: "empty_" + i,
        frames: this.anims.generateFrameNumbers("cell", {
          frames: shuffle([0, 1, 2, 3, 4]),
        }),
        frameRate: 3,
        repeat: -1,
      });

      this.anims.create({
        key: "selected_" + i,
        frames: this.anims.generateFrameNumbers("cellSelected", {
          frames: shuffle([0, 1, 2, 3, 4]),
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Player animations
    this.anims.create({
      key: "player",
      frames: this.anims.generateFrameNumbers("player", {
        frames: shuffle([0, 1, 2, 3, 4]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    // Create number animations
    for (var i = 0; i < 10; i++) {
      this.anims.create({
        key: "number_" + i,
        frames: this.anims.generateFrameNumbers("numbers", {
          frames: shuffle([i, i + 10, i + 20, i + 30]),
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Add minigrids
    this.minigrids = this.buildMinigrid(height, width, scale, this.puzzleSet);

    // Print picross puzzle
    this.cellcontainer = this.buildPuzzle(
      width,
      height,
      scale
    ) as CellContainer;

    // Player
    if (this.cellcontainer) {
      this.player = this.add
        .sprite(this.cellcontainer.x, this.cellcontainer.y, "player")
        .setScale(scale * 1.5)
        .setTint(0x408abd)
        .play("player");

      this.player.currentCell = { x: 0, y: 0 };

      this.resetPlayer(this.cellcontainer);
    } else {
      throw new Error("ERROR: MISSING CELL CONTAINER");
    }
  }

  selectCell() {
    if (this.keys?.select?.isDown) {
      const c =
        this.cells[this.player.currentCell.x][this.player.currentCell.y];
      this.setCellHoverStyles(c);
      this.dragging.push(c);
    }
  }

  resetPlayer(cellcontainer: CellContainer) {
    for (const k in this?.keys) {
      this.keys[k].removeAllListeners();
    }

    this.player.setVisible(true);
    this.player.currentCell = { x: 0, y: 0 };
    this.player.setPosition(cellcontainer.x, cellcontainer.y);

    // Player Controls
    this.keys?.select.on("down", () => {
      const c =
        this.cells[this.player.currentCell.x][this.player.currentCell.y];
      this.setCellHoverStyles(c);
      this.dragging.push(c);
    });

    this.keys?.select.on("up", () => {
      this.dragging.map((c, i, arr) => {
        // Only one in the dragged cells, so just inverse it!
        c.selected = arr.length > 1 ? true : !c.selected;
        c.dragging = false;

        c.setAlpha(0.5);

        this.setCompletedRowsAndColumns(scale);

        this.tweens.add({
          targets: c,
          alpha: 1,
          ease: "Stepped",
          delay: 500 / (i + 1),
          scale: scale,
          onStart: () => {
            if (c.selected) {
              this.emitter?.explode(6, c.x, c.y);
              if (arr.length > 1) {
                this.cameras.main.shake(600 / (i + 1), 0.02 / (i + 1));
              }
            }
          },
          onComplete: () => {
            c.setCrop(0, 0, 32, 32);
          },
        });

        c.play(
          c.selected ? this.getSelectedAnimation() : this.getEmptyAnimation()
        );
      });

      this.dragging = [];

      // Check for solved puzzle and build next if it is solved
      this.checkPuzzle(width, height);
    });
  }

  fillCell(c: CellSprite, index: number, scale: number) {
    c.selected = true;
    this.animateSelectCell(c, index, scale);
  }

  animateSelectCell(c: CellSprite, index: number, scale: number) {
    c.setAlpha(0.5);

    this.tweens.add({
      targets: c,
      alpha: 1,
      ease: "Stepped",
      delay: 500 / (index + 1),
      scale: scale,
      onStart: () => {
        if (c.selected) {
          this.emitter?.explode(6, c.x, c.y);
          this.cameras.main.shake(600 / (index + 1), 0.02 / (index + 1));
        }
      },
    });

    c.play(c.selected ? this.getSelectedAnimation() : this.getEmptyAnimation());
  }

  isPuzzzleSolved(puzz: Nonogram) {
    let result = "";
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (this.cells[i] && this.cells[i][j] && this.cells[i][j].selected) {
          result += `${i}${j}`;
        }
      }
    }

    return sha256(result).toString() === puzz.resultSha;
  }

  addCell(cell: CellSprite, x: number, y: number) {
    if (!this.cells[x]) {
      this.cells[x] = [];
    }

    this.cells[x][y] = cell;
  }

  setCellStyle(cell: CellSprite, scale = 2) {
    cell.selected
      ? this.setCellSelectedStyles(cell, scale)
      : this.setCellEmptyStyles(cell, scale);
  }

  setCellSelectedStyles(cell: CellSprite, scale = 2) {
    cell.play(this.getSelectedAnimation());
    cell.setAlpha(1);
    cell.setCrop(0, 0, 32, 32);
    cell.setScale(scale);
  }

  setCellEmptyStyles(cell: CellSprite, scale = 2) {
    cell.setCrop(0, 0, 32, 32);
    cell.setAlpha(1);
    cell.setScale(scale);
    cell.play(this.getEmptyAnimation());
  }

  setCellHoverStyles(cell: CellSprite, scale = 2) {
    cell.play(this.getSelectedAnimation()).setAlpha(0.8);
    cell.setCrop(1, 1, 30, 30);
    cell.setScale(scale * 0.8);
  }

  setCellDisabledStyles(cell: CellSprite, scale = 2) {
    cell.play(this.getEmptyAnimation()).setAlpha(0.3);
    cell.setCrop(1, 1, 30, 30);
    cell.setScale(scale * 0.8);
  }

  getEmptyAnimation() {
    return this.getRandomAnimation("empty", 5);
  }

  getSelectedAnimation() {
    return this.getRandomAnimation("selected", 5);
  }

  getRandomAnimation(string: string, length = 5) {
    return string + "_" + Math.floor(Math.random() * length);
  }

  update() {
    for (const k in this?.keys) {
      const key = this?.keys[k];

      if (key) {
        if (!key.previousDuration) {
          key.previousDuration = key.getDuration();
        }

        const dur = key.getDuration() - key.previousDuration;

        if (key.isUp) {
          if (key.firedOnce) key.firedOnce = false;
        }

        if (key.isDown && !key.firedOnce) {
          this.movePlayer(key);
          key.firedOnce = true;
        }
      }
      // Sliding controls
      // if (k.isDown && k.getDuration() > 250 && dur > 100) {
      //   k.previousDuration = k.getDuration();
      //   this.movePlayer(k);
      // }
    }
  }
}

export default Battle;
