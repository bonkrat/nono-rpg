import { height, width } from "../battle/constants";

export class End extends Phaser.Scene {
  constructor() {
    super("End");
  }

  create() {
    const curve = new Phaser.Curves.Ellipse(
      width / 2,
      height / 2,
      350,
      200,
      225,
      315
    );

    this.add.textsprite("You are winner", undefined, undefined, curve);
  }
}
