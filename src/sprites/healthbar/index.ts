import { times } from "lodash";
import Phaser from "phaser";
import "./HealthChunk";
import "./HealthCap";

export default class HealthBar extends Phaser.GameObjects.Container {
  maxHealth: number;
  constructor(scene: Phaser.Scene, x: number, y: number, healthAmount: number) {
    super(scene, x, y);
    const healthBarScale = 2 * 0.75;

    this.add(
      scene.add.healthcap(0, 0).setScale(healthBarScale).play("fullHealthCap")
    );

    times(healthAmount, (i) => {
      const chunk = scene.add
        .healthchunk(
          32 * healthBarScale + 10 + 10 * i + 32 * i * healthBarScale,
          0
        )
        .setScale(2 * 0.75)
        .play("fullHealthBar");
      this.add(chunk);
    });

    this.maxHealth = healthAmount;
  }

  setHealth(healthAmount: number) {
    const healthBar = this.getAll() as Phaser.GameObjects.Sprite[];

    healthBar.reverse().forEach((c, i, arr) => {
      if (i === arr.length - 1) {
        if (healthAmount < this.maxHealth) {
          c.play("emptyHealthCap");
        } else {
          c.play("fullHealthCap");
        }
      } else if (i >= healthAmount) {
        c.play("emptyHealthBar");
      } else {
        c.play("fullHealthBar");
      }
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "healthbar",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    healthAmount: number
  ) {
    const healthbar = new HealthBar(this.scene, x, y, healthAmount);

    this.displayList.add(healthbar);

    return healthbar;
  }
);
