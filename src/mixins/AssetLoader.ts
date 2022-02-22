export function LoadableAssets<TBase extends Loadable>(
  Base: TBase,
  assets: {
    spriteConfig?: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>;
    animation?: (scene: Phaser.Scene) => Phaser.Types.Animations.Animation;
  }[],
  key?: string
) {
  return class AssetLoading extends Base {
    public key? = key;
    protected assets = assets;
    protected scene: Phaser.Scene;

    constructor(...args: any[]) {
      super(...args);
      this.scene = args[0];
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
        const spriteConfig = asset.spriteConfig;
        const key = spriteConfig?.key || this.key;

        if (key) {
          if (!this.scene.textures.exists(key)) {
            this.scene.load.spritesheet({
              frameConfig: { frameWidth: 32 },
              key,
              ...asset?.spriteConfig,
            });
          }
        } else {
          throw new Error("Missing key when loading assets for " + Base.name);
        }
      });

      this.scene.load.start();

      await loaderPromise;

      this.assets.forEach((asset) => {
        let animation = undefined;
        let key = asset.spriteConfig?.key || this.key;

        if (!key) {
          if (!key) {
            throw new Error(
              "Missing key when loading animations for " + Base.name
            );
          }
        }

        if (asset.animation) {
          animation = asset.animation(this.scene);
          key = animation.key || key;
        } else {
          animation = {
            key,
            frames: this.scene.anims.generateFrameNumbers(key, {
              frames: [0, 1, 2],
            }),
            frameRate: 3,
            repeat: -1,
          };
        }

        this.scene.anims.create(animation);
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

export function register<T>(
  factoryType: string,
  factoryFunction: Function,
  cb?: (instance: T) => any
) {
  Phaser.GameObjects.GameObjectFactory.register(
    factoryType,
    async function (this: Phaser.GameObjects.GameObjectFactory, ...args: any) {
      const instance = factoryFunction.call(this, ...args);
      await instance.loadAssets();

      if (cb) {
        cb(instance);
      }

      return instance;
    }
  );
}
