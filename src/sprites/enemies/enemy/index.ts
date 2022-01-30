import { AssetLoader } from "../../../utility/AssetLoader";

export abstract class Enemy extends AssetLoader {
  public abstract dialogue: string[];
  public abstract puzzleSet: PuzzleSet;
  protected abstract assets: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];
  protected scene: Phaser.Scene;
  protected sprite!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.scene = scene;
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

  abstract attack(): void;

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
