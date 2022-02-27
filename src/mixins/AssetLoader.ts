import { logger } from "../utils";

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

    fileCompletePromise(key: string) {
      return new Promise<void>((resolve) => {
        this.scene.load.on("filecomplete-spritesheet-" + key, () => {
          this.debug(
            "LOAD ASSETS",
            "filecomplete-" + key + " promise complete"
          );

          resolve();
        });
      });
    }

    async loadAssets() {
      // const loaderPromise = new Promise<void>((resolve, reject) => {
      //   this.scene.load.on(
      //     "complete",
      //     (
      //       _loader: typeof Phaser.Loader,
      //       _complete: number,
      //       failed: number
      //     ) => {
      //       if (failed) {
      //         reject();
      //       }
      //       this.debug(
      //         "LOAD ASSETS",
      //         "Promise fulfilled for this many assets: ",
      //         _complete
      //       );

      //       resolve();
      //     }
      //   );
      // });

      const promises = [] as Promise<void>[];
      this.assets.forEach(async (asset) => {
        const spriteConfig = asset.spriteConfig;
        const key = spriteConfig?.key || this.key;

        if (key) {
          this.debug("LOAD ASSETS", "key: ", key);
          if (!this.scene.textures.exists(key)) {
            this.debug("LOAD ASSETS", "loading asset: ", asset);
            this.scene.load.spritesheet({
              frameConfig: { frameWidth: 32 },
              key,
              ...asset?.spriteConfig,
            });
            promises.push(this.fileCompletePromise(key));
          }
        } else {
          throw new Error("Missing key when loading assets for " + Base.name);
        }
      });

      this.debug("LOAD ASSETS", "STARTING...");
      this.scene.load.start();

      if (this.scene.load.totalToLoad) {
        this.debug(
          "LOAD ASSETS",
          "total loading: ",
          this.scene.load.totalToLoad
        );
      }

      await Promise.all(promises);

      this.debug("LOAD ASSETS", "FINISHED!");

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

        if (!this.scene.anims.get(key)) {
          this.debug("LOAD ANIMATION", "animation created", animation);

          this.scene.anims.create(animation);
        }

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

    private debug(action: string, message: string, data?: any) {
      logger.debug({
        name: "AssetLoader",
        action,
        message,
        timestamp: true,
        data,
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
