export class Controller extends Phaser.Scene {
  constructor() {
    super("Controller");
  }

  create() {
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
