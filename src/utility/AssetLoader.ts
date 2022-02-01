export function LoadableAssets<TBase extends Loadable>(
  Base: TBase,
  assets: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[],
  key: string
) {
  return class AssetLoading extends Base {
    public key = key;
    protected assets = assets;
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
      super(scene);
      this.scene = scene;
    }

    async loadAssets() {
      const loaderPromise = new Promise<void>((resolve, reject) => {
        this.scene.load.on(
          "complete",
          (
            _loader: typeof Phaser.Loader,
            _complete: number,
            failed: number
          ) => {
            if (failed) {
              reject();
            }
            resolve();
          }
        );
      });

      this.assets.forEach(async (asset) => {
        const key = asset.key || this.key;

        this.scene.load.spritesheet({
          frameConfig: { frameWidth: 32 },
          key,
          ...asset,
        });
      });

      this.scene.load.start();

      await loaderPromise;

      this.assets
        .map((asset) => asset.key)
        .forEach((key = this.key) => {
          this.scene.anims.create({
            key,
            frames: this.scene.anims.generateFrameNumbers(key, {
              frames: [0, 1, 2],
            }),
            frameRate: 3,
            repeat: -1,
          });
        });
    }
  };
}

export function register(factoryType: string, factoryFunction: Function) {
  Phaser.GameObjects.GameObjectFactory.register(
    factoryType,
    async function (this: Phaser.GameObjects.GameObjectFactory, ...args: any) {
      const instance = factoryFunction.call(this, ...args);
      await instance.loadAssets();

      return instance;
    }
  );
}
