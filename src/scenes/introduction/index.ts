import { Enemy } from "../../sprites/enemies/enemy";
import { height, width } from "../battle/constants";

export class Introduction extends Phaser.Scene {
  enemyClass!: EnemyClass;
  enemy!: Promise<Enemy>;
  keys!: { next?: Phaser.Input.Keyboard.Key };
  introIndex = 0;

  constructor() {
    super("Introduction");
  }

  init({ enemyClass }: { enemyClass: EnemyClass }) {
    this.enemyClass = enemyClass;
    this.enemy = this.add.enemy(enemyClass);

    this.keys = this.input.keyboard.addKeys({
      next: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
  }

  async create() {
    const enemy = await this.enemy;
    enemy.draw(width / 2, height / 2 - 100);
    enemy.speak(enemy.introduction[this.introIndex]);

    this.keys.next?.on("down", () => {
      if (this.introIndex < enemy.introduction.length - 1) {
        this.introIndex += 1;
        enemy.speak(enemy.introduction[this.introIndex]);
      } else {
        this.scene.transition({
          target: "Battle",
          duration: 0,
          remove: true,
          data: { enemyClass: this.enemyClass },
        });
      }
    });
  }
}
