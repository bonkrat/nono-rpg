import { shuffle } from "lodash";
import karen from "../../assets/sprites/enemies/karen.png";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";

const ASSETS = [
  { url: karen, frameConfig: { frameWidth: 128, frameHeight: 182 } },
];

export class Karen extends Enemy {
  puzzleSet = shuffle(puzzles).slice(0, 1);
  dialogue = ["foobar baz biz", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene, ASSETS);
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(1.75);
    return this;
  }
}

Enemy.register();
