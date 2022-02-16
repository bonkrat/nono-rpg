import { getRandomEnemyClass } from "../../sprites/enemies";
import { Introduction } from "../introduction";

export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }
  create() {
    // this.scene.start("Battle", { enemyClass: getRandomEnemyClass() });
    this.scene.start("Introduction", { enemyClass: getRandomEnemyClass() });
  }
}
