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

    async loadAssets() {
      const promises = new Map<string, Promise<void>>();

      this.assets.forEach(async (asset) => {
        const spriteConfig = asset.spriteConfig;
        const key = spriteConfig?.key || this.key;

        if (key) {
          if (!this.scene.textures.exists(key) && !promises.has(key)) {
            this.debug(
              "LOAD FILES",
              "loading sprite file for: ",
              asset.spriteConfig
            );
            this.scene.load.spritesheet({
              frameConfig: { frameWidth: 32 },
              key,
              ...asset?.spriteConfig,
            });
            promises.set(key, this.fileCompletePromise(key));
          }
        } else {
          throw new Error("Missing key when loading assets for " + Base.name);
        }
      });

      if (promises.size) {
        this.scene.load.start();

        this.debug(
          "LOAD FILES",
          "Loading " + this.scene.load.totalToLoad + " files for " + Base.name,
          this.assets
        );

        for (const [_key, promise] of promises) {
          await promise;
        }

        this.debug("LOAD ASSETS", "loading assets complete", Base.name);

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
        });

        this.debug(
          "LOAD ASSETS",
          "Files and animations loaded for " + Base.name
        );
      } else {
        this.debug(
          "LOAD ASSET",
          "skip loading files and animations for: ",
          Base.name
        );
      }
    }

    private fileCompletePromise(key: string) {
      return new Promise<void>((resolve) => {
        this.scene.load.on("filecomplete-spritesheet-" + key, () => {
          resolve();
        });
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
