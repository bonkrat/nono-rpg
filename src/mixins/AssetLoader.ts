export function LoadableAssets<TBase extends Loadable>(
  Base: TBase,
  assets: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[],
  key?: string
) {
  return class AssetLoading extends Base {
    public key? = key;
    protected assets = assets;

    constructor(...args: any[]) {
      super(...args);
    }

    async loadAssets() {
      console.log("loading for " + Base.name);
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

        if (key) {
          this.scene.load.spritesheet({
            frameConfig: { frameWidth: 32 },
            key,
            ...asset,
          });
        } else {
          throw new Error("Missing key when loading assets for " + Base.name);
        }
      });

      this.scene.load.start();

      await loaderPromise;

      this.assets
        .map((asset) => asset.key)
        .forEach((key = this.key) => {
          if (!key) {
            throw new Error(
              "Missing key when loading animations for " + Base.name
            );
          }

          this.scene.anims.create({
            key,
            frames: this.scene.anims.generateFrameNumbers(key, {
              frames: [0, 1, 2],
            }),
            frameRate: 3,
            repeat: -1,
          });
          // } else {
          //   console.warn(
          //     "Tried loading another animation for key " +
          //       key +
          //       " for asset " +
          //       Base.name
          //   );
          // }
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
