import { shuffle } from "lodash";
import { Cell } from "..";
import { CellState } from "../../common";
import Battle from "../../scenes/battle";
import { scale } from "../../scenes/battle/constants";

export class Player extends Phaser.GameObjects.Sprite {
  currentCell: Coordinates;
  health: number;
  initialHealth: number;
  dragging: Cell[];

  constructor(scene: Battle, x: number, y: number) {
    super(scene, x, y, "player");
    this.currentCell = { x: 0, y: 0 } as Coordinates;
    this.health = 5;
    this.initialHealth = this.health;
    this.dragging = [];

    this.anims.create({
      key: "player",
      frames: this.anims.generateFrameNumbers("player", {
        frames: shuffle([0, 1, 2, 3, 4]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.setScale(scale * 1.5)
      .setTint(0x408abd)
      .play("player");

    this.setVisible(true);

    this.reset();

    this.setupPlayerMovement();
  }

  /**
   * Sets the player to the top left of the nonogram.
   */
  reset() {
    // for (const k in this.scene?.keys) {
    //   this.scene.keys[k].removeAllListeners();
    // }

    const nonogram = (this.scene as Battle).nonogram;
    this.currentCell.x = 0;
    this.currentCell.y = 0;
    this.setPosition(nonogram?.x, nonogram?.y);

    this.setVisible(true);
  }

  resetHealth() {
    this.health = this.initialHealth;
  }

  removeHealth(val: number) {
    this.health -= val;
    return this.health;
  }

  move(key: BattleKey) {
    const scene = this.scene as Battle;
    const { dragging, currentCell } = this;
    const keys = scene.keys;
    const nonogram = scene.nonogram;
    const data = nonogram?.nonogramData;

    if (nonogram && data) {
      if (key === keys?.down) {
        this.moveDown(data);
      } else if (key === keys?.up) {
        this.moveUp();
      } else if (key === keys?.left) {
        this.moveLeft();
      } else if (key === keys?.right) {
        this.moveRight(data);
      }

      scene.tweens.add({
        targets: this,
        duration: 150,
        x: nonogram.x + currentCell.y * 32 * scale,
        y: nonogram.y + currentCell.x * 32 * scale,
        ease: "Bounce",
        onStart: function () {
          if (scene.keys?.select?.isDown) {
            const sprite = scene.nonogram.getCell(currentCell);
            sprite.setCellHoverStyles();

            if (!dragging.includes(sprite)) {
              dragging.push(sprite);
            }
          }
        },
      });
    }
  }

  private setupPlayerMovement() {
    const scene = this.scene as Battle;
    scene.keys?.select.on("down", () => {
      const {
        currentCell: { x, y },
      } = this;

      const c = scene.nonogram?.getCell({ x, y });
      if (c) {
        c.setCellHoverStyles();
        this.dragging.push(c);
      }
    });

    scene.keys?.select.on("up", () => {
      const dragging = this.dragging;

      dragging.forEach((c: Cell, i: number) => {
        // Only one in the dragged cells, so just inverse it!
        if (dragging.length > 1) {
          c.setState(CellState.selected);
        } else {
          c.setState(
            c.state === CellState.selected
              ? CellState.disabled
              : CellState.selected
          );
        }

        c.setAlpha(0.5);

        scene.nonogram?.setCompletedRowsAndColumns();

        scene.tweens.add({
          targets: c,
          alpha: 1,
          ease: "Stepped",
          delay: 500 / (i + 1),
          scale: scale,
          onStart: () => {
            if (c.state === CellState.selected) {
              scene.emitter?.explode(6, c.x, c.y);
              scene.cameras.main.shake(100);
            }
          },
          onComplete: (tween) => {
            this.scene.tweens.remove(tween);
            c.setCrop(0, 0, 32, 32);
          },
        });

        c.play(
          c.state === CellState.selected
            ? c.getSelectedAnimation()
            : c.getEmptyAnimation()
        );
      });

      this.dragging = [];

      // Check for solved puzzle and build next if it is solved
      scene.handlePuzzleUpdate();
    });
  }

  private moveDown(currentNonogram: NonogramData) {
    if (this.currentCell.x < currentNonogram.height - 1) {
      this.currentCell.x += 1;
    }
  }

  private moveUp() {
    if (this.currentCell.x > 0) {
      this.currentCell.x -= 1;
    }
  }

  private moveRight(currentNonogram: NonogramData) {
    if (this.currentCell.y < currentNonogram.width - 1) {
      this.currentCell.y += 1;
    }
  }

  private moveLeft() {
    if (this.currentCell.y > 0) {
      this.currentCell.y -= 1;
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "player",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const player = new Player(this.scene as Battle, x, y);

    this.displayList.add(player);
    this.updateList.add(player);

    return player;
  }
);
