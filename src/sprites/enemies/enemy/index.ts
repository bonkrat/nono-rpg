import bubble from "../../../assets/sprites/bubble.png";
import { random } from "lodash";
import { scale } from "../../../scenes/battle/constants";
import { Battle } from "../../../scenes/battle";
import { LoadableAssets, register } from "../../../mixins/AssetLoader";
import { flamecell } from "../../../assets/sprites";

const BASE_ENEMY_ASSETS = [
  {
    url: bubble,
    key: "bubble",
    frameConfig: { frameWidth: 64, frameHeight: 64 },
  },
  {
    url: flamecell,
    key: "flamecell",
    frameConfig: { frameWidth: 32, frameHeight: 32 },
  },
] as Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];

export abstract class Enemy {
  public abstract dialogue: string[];
  public abstract displayName: string;
  public key!: string;
  protected scene: Phaser.Scene;
  protected speech!: Phaser.GameObjects.Container;
  protected sprite!: Phaser.GameObjects.Sprite;
  protected bubbleSprite!: Phaser.GameObjects.Sprite;
  protected attackEvent!: Phaser.Time.TimerEvent;
  private tweens = [] as Phaser.Tweens.Tween[];
  private flames = [] as Phaser.GameObjects.Sprite[];

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
    // (this.scene as Battle).player.removeHealth(1);
    const scene = this.scene as Battle;
    const randomRow = [
      ...scene.nonogram?.getRandomRow(),
      ...scene.nonogram?.getRandomColumn(),
    ];
    const originalTints = randomRow.map((c) => c.tint);
    const originalAlphas = randomRow.map((c) => c.alpha);
    const attackTint = 0x7a50ba;

    this.tweens.push(
      scene.tweens.addCounter({
        from: 0.3,
        to: 1,
        duration: 500,
        loop: 1000 / 500,
        ease: "Cubic",
        onStart: function () {
          randomRow.forEach((c) => c.setTint(attackTint));
        },
        onUpdate: function (tween) {
          const value = tween.getValue();
          randomRow.forEach((c) => c.setAlpha(value));
        },
        onComplete: () => {
          randomRow.forEach((c, i) => {
            const flame = scene.add.sprite(0, 0, "flamecell").setVisible(false);

            this.flames.push(flame);

            flame
              .setDisplayOrigin(flame.displayOriginX, flame.displayOriginY + 20)
              .setPosition(
                c.getBottomCenter(undefined, true).x,
                c.getBottomCenter(undefined, true).y
              )
              .setScale(scale * 1.5)
              .setTint(attackTint)
              // .setBlendMode(BlendModes.MULTIPLY)
              .play("flamecell");

            let hitPlayer = false;

            this.tweens.push(
              scene.tweens.add({
                targets: flame,
                delay: i * 100,
                duration: 300,
                loop: false,
                scale: scale,
                ease: "Power2",
                onStart: () => {
                  flame.setVisible(true);
                },
                onUpdate: () => {
                  if (
                    scene.nonogram.getCell(scene.player.currentCell) === c &&
                    hitPlayer === false
                  ) {
                    scene.player.removeHealth(1);
                    hitPlayer = true;
                  }
                },
                onComplete: (_tween, targets) => {
                  c.setTint(originalTints[i]);
                  c.setAlpha(originalAlphas[i]);
                  targets[0].destroy();
                },
              })
            );
          });
        },
      })
    );

    this.speak();
  }

  startAttack() {
    this.attackEvent = this.scene.time.addEvent({
      startAt: 2000,
      delay: 3000,
      loop: true,
      callback: this.attack,
      callbackScope: this,
    });

    return this;
  }

  stopAttack() {
    this.attackEvent.remove();
    this.tweens.map((tween) => {
      tween.stop();
      tween.remove();
    });
    this.tweens = [];

    // TODO Use game object pool
    this.flames.forEach((flame) => flame.destroy());
    this.flames = [];
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
          " for class " +
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

    Object.defineProperty(LoadableEnemy, "name", { value: EnemyClass.name });

    const enemy = new LoadableEnemy(this.scene);

    return enemy;
  }
);
