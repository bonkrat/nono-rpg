import { Enemy } from "./enemy";
import karen from "../../assets/sprites/enemies/karen.png";
import { puzzles } from "../../puzzles";
import type Battle from "../../scenes/battle";

const NAME = "Karen";

const KAREN_ASSETS = [
  { url: karen, frameConfig: { frameWidth: 128, frameHeight: 182 } },
];

export class Karen extends Enemy {
  static puzzleSet = [puzzles[0], puzzles[1]];
  dialogue = ["foobar baz biz", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene, KAREN_ASSETS);
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(1.75);
    return this;
  }

  attack() {
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 3000),
      loop: true,
      callback: () => {
        (this.scene as Battle).player.removeHealth(1);
        this.speak();
      },
    });

    return this;
  }
}

Enemy.register(NAME);
