import { STATUS } from "../../plugins/GameStatePlugin";

export class Controller extends Phaser.Scene {
  constructor() {
    super("Controller");
  }

  create() {
    switch (this.gamestate.status) {
      case STATUS.WON:
        this.scene.start("End");
        break;
      case STATUS.LOST:
        this.scene.start("GameOver");
        break;
      case STATUS.IN_PROGRESS:
        this.startEnemyEncounter();
        break;
      default:
        throw new Error("INVALID STATUS: " + this.gamestate.status);
    }
  }

  startEnemyEncounter() {
    if (this.gamestate.currentEnemy.type === "mob") {
      this.scene.start("Battle", {
        enemyClass: this.gamestate.currentEnemy,
      });
    } else {
      this.scene.start("Introduction", {
        enemyClass: this.gamestate.currentEnemy,
      });
    }
  }
}
