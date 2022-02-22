export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.add.textsprite("Game Over", 100, 100);
  }
}
