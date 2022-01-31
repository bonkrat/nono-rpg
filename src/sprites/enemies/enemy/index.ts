import { AssetLoader } from "../../../utility/AssetLoader";
import bubble from "../../../assets/sprites/bubble.png";
import { random } from "lodash";

const BASE_ENEMY_ASSETS = [
  {
    url: bubble,
    key: "bubble",
    frameConfig: { frameWidth: 64, frameHeight: 64 },
  },
] as Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];

export abstract class Enemy extends AssetLoader {
  public abstract dialogue: string[];
  public static puzzleSet: PuzzleSet;
  protected scene: Phaser.Scene;
  protected speech!: Phaser.GameObjects.Container;
  protected sprite!: Phaser.GameObjects.Sprite;
  protected bubbleSprite!: Phaser.GameObjects.Sprite;
  protected assets: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];

  constructor(
    scene: Phaser.Scene,
    assets = [] as Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[]
  ) {
    super(scene);
    this.scene = scene;
    this.assets = [...assets, ...BASE_ENEMY_ASSETS];
  }

  speak() {
    this.speech?.destroy();
    const enemyBounds = this.sprite.getBounds();
    this.speech = this.scene.add
      .textsprite(
        this.dialogue[Math.floor(Math.random() * this.dialogue.length)],
        random(enemyBounds.left, enemyBounds.right),
        enemyBounds.bottom * 0.75,
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

  draw(x: number, y: number, frame = this.key) {
    const xPos = x || 0;
    const yPos = y || 0;
    this.sprite = this.scene.add.sprite(xPos, yPos, this.name).play(frame);
    return this;
  }

  play(anim: string) {
    return this.sprite.play(anim);
  }

  abstract attack(): Enemy;

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

  get name() {
    return this.key;
  }

  set name(name: string) {
    this.key = name;
  }

  static register(name: string) {
    AssetLoader.register(
      "enemy",
      function (
        this: Phaser.GameObjects.GameObjectFactory,
        EnemyClass: EnemyClass
      ): Enemy {
        const enemy = new EnemyClass(this.scene);
        enemy.name = name;

        return enemy;
      }
    );
  }
}
