import { height, scale, width } from "../battle/constants";

export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }
  create() {
    this.add.textsprite("Game Over", width / 2, height / 2, scale, 0xffffff);
  }
}
