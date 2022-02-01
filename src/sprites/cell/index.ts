import { shuffle } from "lodash";
import Phaser from "phaser";
import { CellState } from "../../common";
import { Battle } from "../../scenes/battle";
import { scale } from "../../scenes/battle/constants";

export class Cell extends Phaser.GameObjects.Sprite {
  constructor(scene: Battle, x: number, y: number) {
    super(scene, x, y, "cell");
    this.type = "Cell";
    this.setScale(scale);
  }

  fillCell() {
    this.setState(CellState.selected);
    this.animateSelectCell();
  }

  animateSelectCell() {
    this.setAlpha(0.5);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      ease: "Stepped",
      // delay: 500 / (index + 1),
      scale: scale,
      onStart: () => {
        if (this.state === CellState.selected) {
          const scene = this.scene as Battle;
          scene.emitter?.explode(6, this.x, this.y);
          scene.cameras.main.shake(600);
        }
      },
    });

    this.play(
      this.state === CellState.selected
        ? this.getSelectedAnimation()
        : this.getEmptyAnimation()
    );
  }

  setCellStyle() {
    this.state === CellState.selected
      ? this.setCellSelectedStyles()
      : this.setCellEmptyStyles();
    return this;
  }

  setCellSelectedStyles() {
    this.play(this.getSelectedAnimation());
    this.setAlpha(1);
    this.setCrop(0, 0, 32, 32);
    this.setScale(scale);
  }

  setCellEmptyStyles() {
    this.setState(CellState.empty);
    this.setCrop(0, 0, 32, 32);
    this.setAlpha(1);
    this.setScale(scale);
    this.play(this.getEmptyAnimation());
  }

  setCellHoverStyles() {
    this.play(this.getSelectedAnimation()).setAlpha(0.8);
    this.setCrop(1, 1, 30, 30);
    this.setScale(scale * 0.8);
  }

  setCellDisabledStyles() {
    this.play(this.getEmptyAnimation()).setAlpha(0.3);
    this.setCrop(1, 1, 30, 30);
    this.setScale(scale * 0.8);
  }

  playEmptyAnimation() {
    this.play(this.getEmptyAnimation());

    return this;
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
}

Phaser.GameObjects.GameObjectFactory.register(
  "cell",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const cell = new Cell(this.scene as Battle, x, y);
    for (var i = 0; i < 5; i++) {
      this.scene.anims.create({
        key: "empty_" + i,
        frames: this.scene.anims.generateFrameNumbers("cell", {
          frames: shuffle([0, 1, 2, 3, 4]),
        }),
        frameRate: 3,
        repeat: -1,
      });

      this.scene.anims.create({
        key: "selected_" + i,
        frames: this.scene.anims.generateFrameNumbers("cellSelected", {
          frames: shuffle([0, 1, 2, 3, 4]),
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    this.displayList.add(cell);
    this.updateList.add(cell);

    return cell;
  }
);
