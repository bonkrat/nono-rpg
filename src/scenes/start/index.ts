import { getRandomEnemyClass } from "../../sprites/enemies";

export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }
  create() {
    this.scene.start("Battle", { enemyClass: getRandomEnemyClass() });
  }
}
