import bubble from "../../../assets/sprites/bubble.png";
import { random } from "lodash";
import { scale } from "../../../scenes/battle/constants";
import { Battle } from "../../../scenes/battle";
import { LoadableAssets, register } from "../../../utility/AssetLoader";

const BASE_ENEMY_ASSETS = [
  {
    url: bubble,
    key: "bubble",
    frameConfig: { frameWidth: 64, frameHeight: 64 },
  },
] as Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];

export abstract class Enemy {
  public abstract dialogue: string[];
  public abstract puzzleSet: PuzzleSet;
  public key!: string;
  protected scene: Phaser.Scene;
  protected speech!: Phaser.GameObjects.Container;
  protected sprite!: Phaser.GameObjects.Sprite;
  protected bubbleSprite!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  speak() {
    this.speech?.destroy();
    const enemyBounds = this.sprite.getBounds();

    const randomY = [enemyBounds.top, enemyBounds.bottom][random(1)];

    this.speech = this.scene.add
      .textsprite(
        this.dialogue[random(this.dialogue.length - 1)],
        random(enemyBounds.left, enemyBounds.right),
        randomY,
        0.5
      )
      .setVisible(false);

    if (!this.bubbleSprite) {
      this.bubbleSprite = this.scene.add.sprite(this.x, this.y, "bubble");
    }

    const graphics = this.scene.add.graphics();

    const bounds = this.speech.getBounds();
    graphics.beginPath();
    graphics.fillStyle(0xffffff, 1);
    graphics.setScale(0.25);

    this.scene.add.tween({
      targets: this.bubbleSprite,
      duration: 250,
      ease: "Cubic",
      scaleX: Math.floor((bounds.width + 50) / this.bubbleSprite.width),
      scaleY: Math.floor((bounds.height + 50) / this.bubbleSprite.height),
      x: bounds.centerX,
      y: bounds.centerY,
      flipX: true,
      flipY: true,
    });

    this.bubbleSprite.mask = graphics.createBitmapMask(this.speech);
    this.bubbleSprite.mask.invertAlpha = true;
    this.bubbleSprite.play("bubble");

    this.speech.setVisible(true);

    return this;
  }

  attack() {
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 3000),
      loop: true,
      callback: () => {
        (this.scene as Battle).player.removeHealth(1);
        this.speak();
      },
    });

    return this;
  }

  draw(x?: number, y?: number, frame = this.key) {
    const xPos = x || 0;
    const yPos = y || 0;
    this.sprite = this.scene.add.sprite(xPos, yPos, this.key);
    this.sprite
      .setPosition(this.sprite.displayWidth + 32 * scale, 300)
      .play(frame);
    return this;
  }

  play(anim: string) {
    return this.sprite.play(anim);
  }

  get x() {
    return this.sprite.x;
  }

  set x(newX: number) {
    this.sprite.setX(newX);
  }

  get y() {
    return this.sprite.y;
  }

  set y(newY: number) {
    this.sprite.setY(newY);
  }
}

register(
  "enemy",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    EnemyClass: EnemyClass
  ) {
    if (EnemyClass.assets && !Array.isArray(EnemyClass.assets)) {
      throw new Error(
        "Expected static property assets of " +
          EnemyClass.name +
          " to be an array, but received: " +
          typeof EnemyClass.assets
      );
    }

    const LoadableEnemy = LoadableAssets(
      EnemyClass,
      [...(EnemyClass.assets || []), ...BASE_ENEMY_ASSETS],
      EnemyClass.name
    );

    const enemy = new LoadableEnemy(this.scene);

    return enemy;
  }
);
