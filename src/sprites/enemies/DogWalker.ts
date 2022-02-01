import { Enemy } from "./enemy";
import dogwalker from "../../assets/sprites/enemies/dogwalker.png";
import { puzzles } from "../../puzzles";
import { shuffle } from "lodash";
import { Battle } from "../../scenes/battle";

export class DogWalker extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 1);
  static assets = [
    { url: dogwalker, frameConfig: { frameWidth: 128, frameHeight: 129 } },
  ];
  dialogue = ["check out my dog", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(2.5);
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
