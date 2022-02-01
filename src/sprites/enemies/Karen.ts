import { shuffle } from "lodash";
import karen from "../../assets/sprites/enemies/karen.png";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";

export class Karen extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 1);
  static assets = [
    { url: karen, frameConfig: { frameWidth: 128, frameHeight: 182 } },
  ];
  displayName = "Karen";
  dialogue = ["foobar baz biz", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(1.75);
    return this;
  }
}
