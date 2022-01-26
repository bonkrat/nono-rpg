import { shuffle } from "lodash";
import Phaser from "phaser";

export default class HealthChunk extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "healthchunk");

    this.anims.create({
      key: "fullHealthBar",
      frames: this.anims.generateFrameNumbers("fullHealthBar", {
        frames: shuffle([0, 1, 2]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: "emptyHealthBar",
      frames: this.anims.generateFrameNumbers("emptyHealthBar", {
        frames: shuffle([0, 1, 2]),
      }),
      frameRate: 3,
      repeat: -1,
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "healthchunk",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const healthchunk = new HealthChunk(this.scene, x, y);

    this.displayList.add(healthchunk);
    this.updateList.add(healthchunk);

    return healthchunk;
  }
);
