import { shuffle } from "lodash";
import Phaser from "phaser";
import cell from "./assets/sprites/cell.png";
import cellSelected from "./assets/sprites/cell_selected.png";
import numbers from "./assets/sprites/numbers.png";
import { puzzles } from "./puzzles";
import sha256 from "crypto-js/sha256";
import { isValidPuzzle } from "./puzzles/helpers";

const width = 800;
const height = 600;

class NoNoRPG extends Phaser.Scene {
  constructor(puzzle) {
    super();
    this.cells = [];
    this.dragging = []; // array of currently dragged over cells.
    this.puzzle = puzzle;
  }

  preload() {
    [
      ["cell", cell],
      ["cellSelected", cellSelected],
      ["numbers", numbers],
    ].forEach(([key, url]) => {
      this.load.spritesheet(key, url, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });
  }

  create() {
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

    this.particles = this.add.particles("cellSelected");
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

    const puzz = this.puzzle;

    // Print picross puzzle
    const scale = 2;
    const middle = width - puzz.width * 32 * scale;
    const bottom = height - puzz.height * 32 * scale;

    // Print row clues
    puzz.rowClues.map((clues, i) => {
      clues.map((clue, j) => {
        const clueSprite = this.add.sprite(
          middle - 32 * j * scale - 64,
          bottom + 32 * i * scale - 32 / 4
        );

        clueSprite.play("number_" + clue);
      });
    });

    // Print header clues
    puzz.colClues.map((clues, i) => {
      clues.map((clue, j) => {
        const clueSprite = this.add.sprite(
          middle + 32 * i * scale - 32 / 2 + 6,
          bottom - 32 * scale - j * 32
        );

        clueSprite.play("number_" + clue);
      });
    });

    this.input.on("pointerup", () => {
      this.dragging.map((c, i, arr) => {
        c.selected = true;
        c.dragging = false;

        c.setAlpha(0.5);

        this.tweens.add({
          targets: c,
          alpha: 1,
          ease: "Stepped",
          delay: 500 / (i + 1),
          scale: scale,
          onStart: () => {
            this.emitter.explode(6, c.x, c.y);
            this.cameras.main.shake(600 / (i + 1), 0.02 / (i + 1));
          },
          onComplete: () => {
            c.setCrop(0, 0, 32, 32);
          },
        });

        c.play(this.getSelectedAnimation());
        // c.setScale(scale);
      });

      this.dragging = [];

      //   if (!isValidPuzzle(this.puzzle, this.cells)) {
      //     this.scene.restart(this.puzzle);
      //     console.log("Game Over", this.puzzle);
      //   }

      if (this.isPuzzzleSolved()) {
        // this.stopInputEvents();
        console.log("Puzzle solved!", this.isPuzzzleSolved());
        // this.cells.map((row) => row.map((c) => c.setInteractive(false)));
        this.time.delayedCall(
          1500,
          function (puzz) {
            this.scene.restart(puzz);
          },
          puzzles[1],
          this
        );
      }
    });

    // Print cells
    for (var i = 0; i < puzz.height; i++) {
      for (var j = 0; j < puzz.width; j++) {
        const cell = this.add.sprite(
          middle + 32 * i * scale,
          bottom + 32 * j * scale
        );

        this.addCell(cell, j, i);

        cell.setInteractive(
          new Phaser.Geom.Rectangle(4, 4, 24, 24),
          Phaser.Geom.Rectangle.Contains
        );
        cell.setScale(scale);
        cell.play(this.getEmptyAnimation());

        cell.on("pointerover", (pointer) => {
          const lastCell = this.dragging[this.dragging.length - 1];
          if (pointer.isDown && lastCell !== cell) {
            if (!cell.dragging) {
              this.dragging.push(cell);
              cell.dragging = true;
              this.setCellHoverStyles(cell);
            } else {
              // backtracked;
              const lastCell = this.dragging.pop();
              lastCell.dragging = false;
              this.setCellStyle(lastCell);
            }
          } else {
            if (!cell.selected) {
              this.setCellHoverStyles(cell);
            }
          }
        });

        cell.on("pointerout", () => {
          if (!this.dragging.length) {
            cell.setAlpha(1);

            if (cell.selected) {
              this.setCellSelectedStyles(cell);
            } else {
              this.setCellEmptyStyles(cell);
            }
          }
        });

        cell.on("pointerdown", () => {
          cell.dragging = true;
          this.dragging.push(cell);
          this.setCellHoverStyles(cell);
        });
      }
    }
  }

  isPuzzzleSolved() {
    let result = "";
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (this.cells[i] && this.cells[i][j] && this.cells[i][j].selected) {
          result += `${i}${j}`;
        }
      }
    }

    return sha256(result).toString() === this.puzzle.resultSha;
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
}

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  scene: () => new NoNoRPG(puzzles[0]),
  pixelArt: true,
};

const game = new Phaser.Game(config);
