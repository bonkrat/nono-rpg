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

    this.speakIntro();
  }

  async speakIntro() {
    const enemy = await this.enemy;
    const text = enemy.introduction[this.introIndex];

    enemy.draw(width / 2, height / 2 - 100);
    await enemy.speak(text);

    enemy.speech.map((s) => s.setAlpha(0));
    enemy.speech.setOffset(0, 50);

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
      y: -5,
      ease: "Power2",
      delay: this.tweens.stagger(100, {}),
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }
}
