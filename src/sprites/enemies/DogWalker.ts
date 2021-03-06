import { shuffle } from "lodash";
import dogwalker from "../../assets/sprites/enemies/dogwalker.png";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";

export class DogWalker extends Enemy {
  static puzzleSet = shuffle(puzzles).slice(0, 3);
  static assets = [
    { url: dogwalker, frameConfig: { frameWidth: 128, frameHeight: 129 } },
  ];
  displayName = "Dog Walking Lady";
  description = "Something clever";
  introduction = ["I think this dog likes you"];
  dialogue = ["qix foo", "baz qix "];

  constructor(scene: Phaser.Scene) {
    super(scene);

    // this.scene.time.addEvent({
    //   startAt: 1000,
    //   delay: 4000,
    //   loop: true,
    //   callback: this.speak,
    //   callbackScope: this,
    // });
  }

  attack() {
    this.attackManager.randomCellAttack();
    return this;
  }

  startAttack(): DogWalker {
    this.attackEvent = this.scene.time.addEvent({
      startAt: 500,
      delay: 500,
      loop: true,
      callback: this.attack,
      callbackScope: this,
    });

    return this;
  }

  draw(...args: Parameters<Enemy["draw"]>) {
    super.draw(...args);
    this.sprite.setScale(3);
    return this;
  }
}
