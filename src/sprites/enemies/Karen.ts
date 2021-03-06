import { shuffle } from "lodash";
import karen from "../../assets/sprites/enemies/karen.png";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";

export class Karen extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 3);
  static assets = [
    { url: karen, frameConfig: { frameWidth: 128, frameHeight: 182 } },
  ];
  displayName = "Meddlesome Lady";
  description = "Probably speaking to a manager";
  introduction = ["You cant find good help these days"];
  dialogue = ["Foobar baz qix", "baz qix foobar", "get a job"];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  attack() {
    this.attackManager.cellAreaAttack(1);
    return this;
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(2.5);
    return this;
  }
}
