import { flamecell } from "../../../assets/sprites";
import bubble from "../../../assets/sprites/bubble.png";
import { AttackManager } from "../../../classes/AttackManager";
import { LoadableAssets, register } from "../../../mixins/AssetLoader";
import { Battle } from "../../../scenes/battle";
import { pickRandom } from "../../../utils";
import { TextSprite } from "../../text";

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
  public abstract introduction: string[];
  public abstract attack(): Enemy;
  public key!: string;
  public speech!: TextSprite;
  public sprite: Phaser.GameObjects.Sprite;
  public bubbleSprite!: Phaser.GameObjects.Sprite;

  protected scene: Phaser.Scene;
  protected attackEvent!: Phaser.Time.TimerEvent;
  protected attackManager: AttackManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.attackManager = new AttackManager(scene as Battle);
    this.sprite = scene.add.sprite(0, 0, this.key).setVisible(false);
  }

  async speak(
    text = pickRandom(this.dialogue),
    x = 0,
    y = 0,
    scale = 1,
    tint = 0xffffff,
    curve?: Phaser.Curves.Curve,
    bubble = false
  ) {
    this.speech?.destroy();

    const enemyBounds = this.sprite.getBounds();

    let textCurve = curve;
    if (!curve) {
      const startPoint = new Phaser.Math.Vector2(
        enemyBounds.left - 50,
        enemyBounds.bottom
      );
      const endPoint = new Phaser.Math.Vector2(
        enemyBounds.right + 200,
        enemyBounds.bottom
      );

      textCurve = new Phaser.Curves.Line(startPoint, endPoint);
    }

    this.speech = await this.scene.add.textsprite(
      text,
      x,
      y,
      scale,
      tint,
      textCurve
    );

    if (bubble) {
      this.createSpeechBubble(x, y);
    }

    return this.speech;
  }

  createSpeechBubble(x: number, y: number) {
    const speech = this.speech,
      graphics = this.scene.add.graphics(),
      bounds = this.speech.getBounds();

    if (!this.bubbleSprite) {
      this.bubbleSprite = this.scene.add.sprite(x, y, "bubble");
    }

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

    this.bubbleSprite.mask = graphics.createBitmapMask(speech.container);
    this.bubbleSprite.mask.invertAlpha = true;
    this.bubbleSprite.play("bubble");
    speech.setVisible(true);

    return this;
  }

  /**
   * Default attack sequence. Override for enemy specific attack sequence.
   * Starts in 1 second and attacke every 3 seconds by default. Loops indefinintely until the attack is stopped.
   * @returns Enemy
   */
  startAttack() {
    this.attackEvent = this.scene.time.addEvent({
      startAt: 2000,
      delay: 3000,
      loop: true,
      callback: this.attack,
      callbackScope: this,
    });

    return this as Enemy;
  }

  /**
   * Stops an enemy attack sequence by removing the attack timer event and stopping all attack tweens.
   */
  stopAttack() {
    this.attackEvent.remove();
    this.attackManager.stopAttack();
  }

  draw(x?: number, y?: number, frame = this.key) {
    const xPos = x || 0;
    const yPos = y || 0;
    this.sprite.setPosition(xPos, yPos);
    this.sprite.play(frame);
    this.sprite.setVisible(true);
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
      [...(EnemyClass.assets || []), ...BASE_ENEMY_ASSETS].map(
        (spriteConfig) => ({ spriteConfig })
      ),
      EnemyClass.name
    );

    Object.defineProperty(LoadableEnemy, "name", { value: EnemyClass.name });

    const enemy = new LoadableEnemy(this.scene);

    return enemy;
  }
);
