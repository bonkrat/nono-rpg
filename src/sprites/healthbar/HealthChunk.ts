import { shuffle } from "lodash";
import Phaser from "phaser";

export default class HealthChunk extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "healthchunk");
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "healthchunk",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const healthchunk = new HealthChunk(this.scene, x, y);

    this.scene.anims.create({
      key: "fullHealthBar",
      frames: this.scene.anims.generateFrameNumbers("fullHealthBar", {
        frames: shuffle([0, 1, 2]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "emptyHealthBar",
      frames: this.scene.anims.generateFrameNumbers("emptyHealthBar", {
        frames: shuffle([0, 1, 2]),
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.displayList.add(healthchunk);
    this.updateList.add(healthchunk);

    return healthchunk;
  }
);
