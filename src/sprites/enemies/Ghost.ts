import { shuffle } from "lodash";
import ghost from "../../assets/sprites/enemies/ghost.png";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";

export class Ghost extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 3);
  static assets = [
    { url: ghost, frameConfig: { frameWidth: 128, frameHeight: 128 } },
  ];
  displayName = "Average Ghost";
  description = "Worked itself to death";
  dialogue = ["ooooooo", "aaaaaa", "eeeee"];
  introduction = ["oooooooo", "aaaaaa", "eeeeeget a job"];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  attack() {
    this.attackManager.rowAndColumnAttack();
    return this;
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(3);
    return this;
  }
}
