import { shuffle } from "lodash";
import Phaser from "phaser";

export default class HealthCap extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "healthcap");
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "healthcap",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const healthcap = new HealthCap(this.scene, x, y);

    this.scene.anims.create({
      key: "fullHealthCap",
      frames: this.scene.anims.generateFrameNumbers("fullHealthCap", {
        frames: shuffle([0, 1, 2]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "emptyHealthCap",
      frames: this.scene.anims.generateFrameNumbers("emptyHealthCap", {
        frames: shuffle([0, 1, 2]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.displayList.add(healthcap);
    this.updateList.add(healthcap);

    return healthcap;
  }
);
