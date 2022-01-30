export abstract class AssetLoader {
  public key!: string;
  protected abstract assets: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];
  protected scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async loadAssets() {
    const loaderPromise = new Promise<void>((resolve, reject) => {
      this.scene.load.on(
        "complete",
        (_loader: typeof Phaser.Loader, _complete: number, failed: number) => {
          if (failed) {
            reject();
          }
          resolve();
        }
      );
    });

    this.assets.forEach((asset, _, arr) => {
      if (arr.length > 1 && !asset.key) {
        throw new Error(
          "ERROR: Duplicate key for different assets. Are you missing a key for this asset config?"
        );
      }
      this.scene.load.spritesheet({
        frameConfig: { frameWidth: 32 },
        key: this.key,
        ...asset,
      });
    });

    this.scene.load.start();

    await loaderPromise;

    this.scene.anims.create({
      key: this.key,
      frames: this.scene.anims.generateFrameNumbers(this.key, {
        frames: [0, 1, 2],
      }),
      frameRate: 3,
      repeat: -1,
    });
  }

  static register(factoryType: string, factoryFunction: Function) {
    Phaser.GameObjects.GameObjectFactory.register(
      factoryType,
      async function (
        this: Phaser.GameObjects.GameObjectFactory,
        ...args: any
      ) {
        const instance = factoryFunction.call(this, ...args);
        await instance.loadAssets();

        return instance;
      }
    );
  }
}
