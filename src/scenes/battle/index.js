import { shuffle } from "lodash";
import Phaser from "phaser";
import cell from "../../assets/sprites/cell.png";
import cellSelected from "../../assets/sprites/cell_selected.png";
import numbers from "../../assets/sprites/numbers.png";
import player from "../../assets/sprites/player.png";
import { puzzles } from "../../puzzles";
import sha256 from "crypto-js/sha256";

const width = 800;
const height = 600;

class Battle extends Phaser.Scene {
  constructor(puzzle) {
    super();
    this.cells = [];
    this.dragging = []; // array of currently dragged over cells.
    this.puzzle = puzzle;
    this.player;
    this.keys;
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
    this.rowClues = puzz.rowClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = this.add.sprite(
          middle - 32 * j * scale - 64,
          bottom + 32 * i * scale - 32 / 4
        );

        clueSprite.play("number_" + clue);

        return clueSprite;
      });
    });

    // Print header clues
    this.colClues = puzz.colClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = this.add.sprite(
          middle + 32 * i * scale - 32 / 2 + 6,
          bottom - 32 * scale - j * 32
        );

        clueSprite.play("number_" + clue);

        return clueSprite;
      });
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
      }
    }

    // Player
    this.player = this.add
      .sprite(middle, bottom)
      .setScale(scale * 1.5)
      .setTint(0x408abd)
      .play("player");

    this.player.currentCell = { x: 0, y: 0 };

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

    const selectCell = () => {
      if (this.keys.select.isDown) {
        const c =
          this.cells[this.player.currentCell.x][this.player.currentCell.y];
        this.setCellHoverStyles(c);
        this.dragging.push(c);
      }
    };

    // Player Controls
    this.keys.down.on("down", () => {
      if (this.player.currentCell.x < this.puzzle.height - 1) {
        this.movePlayer("down");
        this.player.currentCell.x += 1;
        selectCell();
      }
    });

    this.keys.up.on("down", () => {
      if (this.player.currentCell.x > 0) {
        this.movePlayer("up");
        this.player.currentCell.x -= 1;
        selectCell();
      }
    });

    this.keys.left.on("down", () => {
      if (this.player.currentCell.y > 0) {
        this.movePlayer("left");
        this.player.currentCell.y -= 1;
        selectCell();
      }
    });

    this.keys.right.on("down", () => {
      if (this.player.currentCell.y < this.puzzle.width - 1) {
        this.movePlayer("right");
        this.player.currentCell.y += 1;
        selectCell();
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
      if (this.isPuzzzleSolved()) {
        this.keys.select.removeAllListeners();
        this.player.setVisible(false);
        this.rowClues.map((r) => r.map((c) => c.setVisible(false)));
        this.colClues.map((r) => r.map((c) => c.setVisible(false)));

        this.cells.map((row) =>
          row
            .filter((c) => !c.selected)
            .map((c, i, arr) => {
              c.selected = true;
              c.setVisible(false);
              return this.time.delayedCall(
                1500,
                function (c, i, scale) {
                  this.animateSelectCell(c, 0, scale);
                  c.setVisible(true);
                },
                [c, i, scale],
                this
              );
            })
        );

        this.time.delayedCall(
          3000,
          function (puzz) {
            this.puzzle = puzz;
            this.scene.restart();
          },
          [puzzles[Math.floor(Math.random() * puzzles.length)]],
          this
        );
      }
    });
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