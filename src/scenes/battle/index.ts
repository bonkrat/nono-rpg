import sha256 from "crypto-js/sha256";
import { shuffle } from "lodash";
import Phaser from "phaser";
import {
  BattleStateManager,
  PuzzleSet,
  BattleKeys,
  CellContainer,
  CellSprite,
  Nonogram,
  Coordinates,
  BattleState,
} from "../../../types/puzzle";
import cell from "../../assets/sprites/cell.png";
import cellSelected from "../../assets/sprites/cell_selected.png";
import letters from "../../assets/sprites/letters.png";
import numbers from "../../assets/sprites/numbers.png";
import player from "../../assets/sprites/player.png";
import { CellState } from "../../common";
import {
  addFontAnims,
  buildMinigrid,
  buildPuzzle,
  loadFontFace,
  movePlayer,
  resetPlayer,
} from "../../helpers";

const width = 800;
const height = 600;
const scale = 2;

class Battle extends Phaser.Scene {
  public battleState!: BattleStateManager;
  public puzzleSet: PuzzleSet;
  public playerSprite!: Phaser.GameObjects.Sprite;
  public keys?: BattleKeys;
  public emitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    puzzleSet: PuzzleSet
  ) {
    super(config);
    this.puzzleSet = puzzleSet;
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
    loadFontFace(this);
  }

  create() {
    this.battleState.set({
      cells: [],
      dragging: this.add.group(),
      puzzle: this.puzzleSet[0],
      player: { x: 0, y: 0 },
      currentNonogram: this.puzzleSet[0].puzzles[0],
      currentPuzzleSection: 0,
      currentPuzzleIndex: 0,
      completedPuzzles: [],
    });

    // Load animations for text
    addFontAnims(this);

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
    this.battleState.set(
      "minigrids",
      buildMinigrid(this, height, width, scale, this.puzzleSet)
    );

    // Print picross puzzle
    const cellcontainer = buildPuzzle(
      this,
      this.battleState,
      width,
      height,
      scale
    );

    // Player
    this.playerSprite = this.add
      .sprite(cellcontainer.x, cellcontainer.y, "player")
      .setScale(scale * 1.5)
      .setTint(0x408abd)
      .play("player");

    this.battleState.events.on("changedata-player", (scene: Battle) => {
      const { player, cellContainer, cells, dragging } =
        scene.battleState.getAll();

      this.tweens.add({
        targets: this.playerSprite,
        duration: 150,
        x: cellContainer.x + player.y * 32 * scale,
        y: cellContainer.y + player.x * 32 * scale,
        ease: "Bounce",
        onComplete: () =>
          this.selectCell({
            player,
            cells,
            dragging,
          } as BattleState),
      });
    });

    resetPlayer(this, cellcontainer);
  }

  selectCell({ player, cells, dragging }: BattleState) {
    if (this.keys?.select?.isDown) {
      const c = cells[player.x][player.y];
      this.setCellHoverStyles(c);

      if (!dragging.contains(c)) {
        dragging.add(c);
      }
    }
  }

  fillCell(c: CellSprite, index: number, scale: number) {
    c.setState(CellState.selected);
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
        if (c.state === CellState.selected) {
          this.emitter?.explode(6, c.x, c.y);
          this.cameras.main.shake(600 / (index + 1), 0.02 / (index + 1));
        }
      },
    });

    c.play(
      c.state === CellState.selected
        ? this.getSelectedAnimation()
        : this.getEmptyAnimation()
    );
  }

  isPuzzzleSolved(puzz: Nonogram) {
    const cells = this.battleState.get("cells");

    let result = "";
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (
          cells[i] &&
          cells[i][j] &&
          cells[i][j].state === CellState.selected
        ) {
          result += `${i}${j}`;
        }
      }
    }

    return sha256(result).toString() === puzz.resultSha;
  }

  setCellStyle(cell: CellSprite, scale = 2) {
    cell.state === CellState.selected
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
        if (key.isUp) {
          if (key.firedOnce) key.firedOnce = false;
        }

        if (key.isDown && !key.firedOnce) {
          movePlayer(this, this.battleState, key);
          key.firedOnce = true;
        }

        // Sliding controls
        if (!key.previousDuration) {
          key.previousDuration = key.getDuration();
        }

        const dur = key.getDuration() - key.previousDuration;
        if (key.isDown && key.getDuration() > 250 && dur > 200) {
          key.previousDuration = key.getDuration();
          movePlayer(this, this.battleState, key);
        }
      }
    }
  }
}

export default Battle;
