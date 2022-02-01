import { Enemy } from "./enemy";
import ghost from "../../assets/sprites/enemies/ghost.png";
import { puzzles } from "../../puzzles";
import type { Battle } from "../../scenes/battle";
import { shuffle } from "lodash";

export class Ghost extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 2);
  static assets = [
    { url: ghost, frameConfig: { frameWidth: 128, frameHeight: 128 } },
  ];
  dialogue = ["ooooooo", "aaaaaa"];

  constructor(scene: Phaser.Scene) {
    super(scene);
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
