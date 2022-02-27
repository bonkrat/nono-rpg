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
    (await this.enemy).draw(width / 2, height / 2);
    await this.drawNameText();
    this.createKeys();
    this.drawDescription();
    this.speakIntro();
  }

  /**
   * Speaks the introduction text of the enemy in a speech bubble.
   */
  private async speakIntro() {
    const enemy = await this.enemy,
      text = enemy.introduction[this.introIndex],
      bounds = enemy.sprite.getBounds(),
      startPoint = new Phaser.Math.Vector2(200, bounds.bottom + 50),
      endPoint = new Phaser.Math.Vector2(width - 200, bounds.bottom + 50),
      line = new Phaser.Curves.Line(startPoint, endPoint);

    enemy.speak(text, 0.75, 0xffffff, line);
  }

  /**
   * Prints the name of the enemy in an arc above their sprite.
   */
  private async drawNameText() {
    const enemy = await this.enemy,
      bounds = enemy.sprite.getBounds(),
      curve = new Phaser.Curves.Ellipse(
        bounds.centerX,
        bounds.top + 100,
        350,
        200,
        225,
        315
      );

    await this.add.textsprite(enemy.displayName, 2.5, 0xabcdef, curve);
  }

  /**
   * Prints a description of the enemy below their sprite.
   */
  private async drawDescription() {
    const enemy = await this.enemy,
      bounds = enemy.sprite.getBounds(),
      curve = new Phaser.Curves.Ellipse(
        bounds.centerX,
        bounds.top + 150,
        350,
        200,
        235,
        300
      );

    await enemy.speak(enemy.description, 0.5, undefined, curve);

    enemy.speech.map((s) => s.setAlpha(0));

    const targets = enemy.speech.getLetters();

    this.add.tween({
      targets,
      alpha: 1,
      ease: "Stepped",
      delay: this.tweens.stagger(75, {}),
      duration: 500,
    });

    this.add.tween({
      targets,
      y: "+=10",
      ease: "Power2",
      delay: this.tweens.stagger(100, {}),
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Creates keys for iterating through the enemy introduction text.
   */
  private async createKeys() {
    const enemy = await this.enemy;
    this.keys.next?.on("down", () => {
      if (this.introIndex < enemy.introduction.length - 1) {
        this.introIndex += 1;
        this.speakIntro();
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
