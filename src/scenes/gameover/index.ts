import { TextSprite } from "../../sprites/text";
import { width, height } from "../battle/constants";

export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  async create() {
    const curve = new Phaser.Curves.Ellipse(
      width / 2,
      height / 2,
      350,
      200,
      225,
      360,
      true
    );

    this.staggerText(
      await this.add.textsprite("Game Over", undefined, undefined, curve)
    );
  }

  /**
   * Prints each letter of the text at a staggered delay.
   * @param text text to print
   * @param delay time to delay over in milliseconds
   */
  private staggerText(text: TextSprite, delay = 0) {
    const targets = text.mapLetters((l) => l.setAlpha(0));
    this.time.delayedCall(delay, () => {
      this.add.tween({
        targets,
        alpha: 1,
        ease: "Stepped",
        delay: this.tweens.stagger(150, {}),
        duration: 2000,
      });
    });
  }
}
