import { shuffle } from "lodash";
import dogwalker from "../../assets/sprites/enemies/dogwalker.png";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";

export class DogWalker extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 1);
  static assets = [
    { url: dogwalker, frameConfig: { frameWidth: 128, frameHeight: 129 } },
  ];
  displayName = "Dog Walker";
  dialogue = ["check out my dog", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(2.5);
    return this;
  }
}
