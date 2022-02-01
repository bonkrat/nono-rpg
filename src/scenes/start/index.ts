import { getRandomEnemyClass } from "../../sprites/enemies";
import { Battle } from "../battle";

export class Start extends Phaser.Scene {
  constructor() {
    super({ key: "Start" });
  }
  create() {
    this.scene.start(Battle.name, { enemyClass: getRandomEnemyClass() });
  }
}
