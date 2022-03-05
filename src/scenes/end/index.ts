export class End extends Phaser.Scene {
  constructor() {
    super("End");
  }

  init() {
    this.add.textsprite("You are winner", 100, 100);
  }
}
