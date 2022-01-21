import { shuffle } from "lodash";
import Phaser from "phaser";
import cell from "../../assets/sprites/cell.png";
import cellSelected from "../../assets/sprites/cell_selected.png";
import numbers from "../../assets/sprites/numbers.png";
import player from "../../assets/sprites/player.png";
import { puzzles } from "../../puzzles";
import sha256 from "crypto-js/sha256";
import animals from "../../puzzles/medium/animals";
import { buildMinigrid } from "./minigrid";

const width = 800;
const height = 600;
const scale = 2;

class Battle extends Phaser.Scene {
  constructor(puzzle) {
    super();
    this.cells = [];
    this.dragging = []; // array of currently dragged over cells.
    this.puzzle = puzzle;
    this.player;
    this.keys;
    this.puzzleContainers = [];
  }

  preload() {
    [
      ["cell", cell],
      ["cellSelected", cellSelected],
      ["numbers", numbers],
      ["player", player],
    ].forEach(([key, url]) => {
      this.load.spritesheet(key, url, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });
  }

  create() {
    // Setup keyboard controls
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      select: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });

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

    // Add minigrid

    this.minigrid = buildMinigrid.call(this, height, scale);

    console.log("minigrid", this.minigrid);

    // Print picross puzzle
    this.cellcontainer = this.buildPuzzle(scale);

    // Player
    this.player = this.add
      .sprite(this.cellcontainer.x, this.cellcontainer.y)
      .setScale(scale * 1.5)
      .setTint(0x408abd)
      .play("player");

    this.player.currentCell = { x: 0, y: 0 };

    this.resetPlayer(this.cellcontainer);
  }

  selectCell = () => {
    if (this.keys.select.isDown) {
      const c =
        this.cells[this.player.currentCell.x][this.player.currentCell.y];
      this.setCellHoverStyles(c);
      this.dragging.push(c);
    }
  };

  resetPlayer(cellcontainer) {
    for (const k in this.keys) {
      this.keys[k].removeAllListeners();
    }

    this.player.setVisible(true);
    this.player.currentCell = { x: 0, y: 0 };
    console.log(
      "this.cellcontainer position",
      cellcontainer.x,
      cellcontainer.y
    );
    this.player.setPosition(cellcontainer.x, cellcontainer.y);

    this.movePlayer = (direction) => {
      this.tweens.add({
        targets: this.player,
        duration: 150,
        ...(["left", "right"].includes(direction) && {
          x: (direction === "left" ? "-" : "+") + "=" + 32 * scale,
        }),
        ...(["up", "down"].includes(direction) && {
          y: (direction === "up" ? "-" : "+") + "=" + 32 * scale,
        }),
        ease: "Bounce",
      });
    };

    // Player Controls
    this.keys.down.on("down", () => {
      console.log(this.player.x, this.player.y);
      console.log(this.player.currentCell);
      if (
        this.player.currentCell.x <
        this.puzzle.puzzles[this.currentPuzzle].height - 1
      ) {
        this.movePlayer("down");
        this.player.currentCell.x += 1;
        this.selectCell();
      }
    });

    this.keys.up.on("down", () => {
      if (this.player.currentCell.x > 0) {
        this.movePlayer("up");
        this.player.currentCell.x -= 1;
        this.selectCell();
      }
    });

    this.keys.left.on("down", () => {
      if (this.player.currentCell.y > 0) {
        this.movePlayer("left");
        this.player.currentCell.y -= 1;
        this.selectCell();
      }
    });

    this.keys.right.on("down", () => {
      if (
        this.player.currentCell.y <
        this.puzzle.puzzles[this.currentPuzzle].width - 1
      ) {
        this.movePlayer("right");
        this.player.currentCell.y += 1;
        this.selectCell();
      }
    });

    this.keys.select.on("down", () => {
      const c =
        this.cells[this.player.currentCell.x][this.player.currentCell.y];
      this.setCellHoverStyles(c);
      this.dragging.push(c);
      //   this.setCellHoverStyles(c);
      //   this.dragging.push(c);
    });

    this.keys.select.on("up", () => {
      this.dragging.map((c, i, arr) => {
        // Only one in the dragged cells, so just inverse it!
        c.selected = arr.length > 1 ? true : !c.selected;
        c.dragging = false;

        c.setAlpha(0.5);

        this.tweens.add({
          targets: c,
          alpha: 1,
          ease: "Stepped",
          delay: 500 / (i + 1),
          scale: scale,
          onStart: () => {
            if (c.selected && arr.length > 1) {
              this.emitter.explode(6, c.x, c.y);
              this.cameras.main.shake(600 / (i + 1), 0.02 / (i + 1));
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

      // Check for solved puzzle
      this.checkPuzzle(this.cellcontainer);
    });
  }

  checkPuzzle(cellcontainer) {
    if (this.isPuzzzleSolved(this.puzzle.puzzles[this.currentPuzzle])) {
      this.keys.select.removeAllListeners();
      this.player.setVisible(false);
      this.rowClues.map((r) => r.map((c) => c.setVisible(false)));
      this.colClues.map((r) => r.map((c) => c.setVisible(false)));
      const solvedContainer = this.cellcontainer;

      // Reset current puzzle
      this.currentPuzzle += 1;
      this.cellcontainer = this.buildPuzzle(scale);
      this.resetPlayer(this.cellcontainer);

      this.time.delayedCall(
        1000,
        (cellcontainer) => {
          const path = { t: 0, vec: new Phaser.Math.Vector2() };
          const startPoint = new Phaser.Math.Vector2(
            cellcontainer.x,
            cellcontainer.y
          );
          var controlPoint1 = new Phaser.Math.Vector2(
            cellcontainer.x + 300,
            cellcontainer.y - 300
          );
          var controlPoint2 = new Phaser.Math.Vector2(
            cellcontainer.x + 100,
            cellcontainer.y - 300
          );
          var endPoint = new Phaser.Math.Vector2(
            this.minigrid.x + 32,
            this.minigrid.y + 32
          );
          var curve = new Phaser.Curves.CubicBezier(
            startPoint,
            controlPoint1,
            controlPoint2,
            endPoint
          );

          this.tweens.add({
            targets: path,
            t: 1,
            ease: "Sine.easeInOut",
            duration: 1000,
            onUpdate: () => {
              curve.getPoint(path.t, path.vec);
              cellcontainer.x = path.vec.x;
              cellcontainer.y = path.vec.y;
            },
          });

          this.tweens.add({
            targets: cellcontainer,
            duration: 500,
            scale: scale / 10,
            onComplete: () => {
              this.time.delayedCall(
                1500,
                (currentPuzzle, numPuzzles) => {
                  cellcontainer.x =
                    this.minigrid.x + this.minigrid.getAt(currentPuzzle - 1).x;
                  cellcontainer.y =
                    this.minigrid.y + this.minigrid.getAt(currentPuzzle - 1).y;
                  this.emitter.explode(32, cellcontainer.x, cellcontainer.y);
                  this.cameras.main.shake(200);
                  cellcontainer.getAll().map((c) => !c.selected && c.destroy());
                },
                [this.currentPuzzle, this.puzzle.puzzles.length],
                this
              );
            },
          });
        },
        [solvedContainer],
        this
      );
    }
  }

  buildPuzzle(scale) {
    if (this.puzzle.puzzles && !this.currentPuzzle) {
      this.currentPuzzle = 0;
    }

    const puzz = this.puzzle.puzzles[this.currentPuzzle];
    const middle = width - puzz.width * 32 * scale;
    const bottom = height - puzz.height * 32 * scale;
    const container = this.add.container(middle, bottom);
    const cellcontainer = this.add.container(container.x, container.y);

    // Create emitter
    this.particles = this.add.particles("cellSelected");
    this.minigridparticles = this.add.particles("cellSelected");

    this.emitter = this.particles.createEmitter({
      frame: 0,
      lifespan: 1000,
      speed: 600,
      //   alpha: { start: 1, end: 0 },
      gravityY: 2000,
      scale: { start: scale, end: 0.5 },
      scale: 1,
      rotate: { start: 0, end: 360, ease: "Power2" },
      //   blendMode: "ADD",
      on: false,
    });

    cellcontainer.add(this.particles);
    // minigrid.add(this.minigridparticles);

    // Print row clues
    this.rowClues = puzz.rowClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = this.add.sprite(
          -32 * j * scale - 64,
          32 * i * scale - 32 / 4
        );

        container.add(clueSprite);
        clueSprite.play("number_" + clue);

        return clueSprite;
      });
    });

    // Print header clues
    this.colClues = puzz.colClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = this.add.sprite(
          32 * i * scale,
          0 - 32 * scale - j * scale * 32 - 32 / 4
        );

        clueSprite.play("number_" + clue);
        container.add(clueSprite);

        return clueSprite;
      });
    });

    // Print cells
    for (var i = 0; i < puzz.height; i++) {
      for (var j = 0; j < puzz.width; j++) {
        const cell = this.add.sprite(32 * i * scale, 32 * j * scale);

        this.addCell(cell, j, i);
        cellcontainer.add(cell);

        cell.setInteractive(
          new Phaser.Geom.Rectangle(4, 4, 24, 24),
          Phaser.Geom.Rectangle.Contains
        );
        cell.setScale(scale);
        cell.play(this.getEmptyAnimation());
      }
    }

    return cellcontainer;
  }

  animateSelectCell(c, index, scale) {
    c.setAlpha(0.5);

    this.tweens.add({
      targets: c,
      alpha: 1,
      ease: "Stepped",
      delay: 500 / (index + 1),
      scale: scale,
      onStart: () => {
        if (c.selected) {
          this.emitter.explode(6, c.x, c.y);
          this.cameras.main.shake(600 / (index + 1), 0.02 / (index + 1));
        }
      },
    });

    c.play(c.selected ? this.getSelectedAnimation() : this.getEmptyAnimation());
  }

  isPuzzzleSolved(puzz) {
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

  addCell(cell, x, y) {
    if (!this.cells[x]) {
      this.cells[x] = [];
    }

    this.cells[x][y] = cell;
  }

  setCellStyle(cell, scale = 2) {
    cell.selected
      ? this.setCellSelectedStyles(cell, scale)
      : this.setCellEmptyStyles(cell, scale);
  }

  setCellSelectedStyles(cell, scale = 2) {
    cell.play(this.getSelectedAnimation());
    cell.setAlpha(1);
    cell.setCrop(0, 0, 32, 32);
    cell.setScale(scale);
  }

  setCellEmptyStyles(cell, scale = 2) {
    cell.setCrop(0, 0, 32, 32);
    cell.setAlpha(1);
    cell.setScale(scale);
    cell.play(this.getEmptyAnimation());
  }

  setCellHoverStyles(cell, scale = 2) {
    cell.play(this.getSelectedAnimation()).setAlpha(0.7);
    cell.setCrop(1, 1, 30, 30);
    cell.setScale(scale * 0.8);
  }

  getEmptyAnimation() {
    return this.getRandomAnimation("empty", 5);
  }

  getSelectedAnimation() {
    return this.getRandomAnimation("selected", 5);
  }

  getRandomAnimation(string, length = 5) {
    return string + "_" + Math.floor(Math.random() * length);
  }

  update() {
    // Controls player "sliding"
    [this.keys.up, this.keys.down, this.keys.left, this.keys.right].map((k) => {
      if (!k.previousDuration) {
        k.previousDuration = k.getDuration();
      }

      const dur = k.getDuration() - k.previousDuration;

      if (k.isDown && k.getDuration() > 500 && dur > 100) {
        k.previousDuration = k.getDuration();
        k.emit("down");
      }

      if (k.isUp) {
        k.previousDuration = 0;
      }
    });
  }
}

export default Battle;
