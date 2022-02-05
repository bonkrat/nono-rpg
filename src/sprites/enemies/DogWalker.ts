import { shuffle } from "lodash";
import dogwalker from "../../assets/sprites/enemies/dogwalker.png";
import { puzzles } from "../../puzzles";
import { Battle } from "../../scenes/battle";
import { Enemy } from "./enemy";

export class DogWalker extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 3);
  static assets = [
    { url: dogwalker, frameConfig: { frameWidth: 128, frameHeight: 129 } },
  ];
  displayName = "Dog Walker";
  dialogue = ["check out my dog", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  attack() {
    const randomCell = (this.scene as Battle).nonogram.getRandomCell();
    this.attackManager.cellAttack(randomCell);
    this.speak();
  }

  startAttack(): DogWalker {
    this.attackEvent = this.scene.time.addEvent({
      startAt: 1000,
      delay: 1000,
      loop: true,
      callback: this.attack,
      callbackScope: this,
    });

    return this;
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(2.5);
    return this;
  }
}
