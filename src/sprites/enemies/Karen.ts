import { Enemy } from "./enemy";
import karen from "../../assets/sprites/enemies/karen.png";
import { puzzles } from "../../puzzles";
import type Battle from "../../scenes/battle";

const NAME = "Karen";

export class Karen extends Enemy {
  dialogue = ["Where is your mother?"];
  puzzleSet = [puzzles[0], puzzles[1]];
  assets = [{ url: karen, frameConfig: { frameWidth: 128, frameHeight: 182 } }];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(1.75);
    return this;
  }

  attack(): void {
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 3000),
      loop: true,
      callback: () => {
        (this.scene as Battle).player.removeHealth;
      },
    });
  }
}

Enemy.register(NAME);
