import { SpritePool } from "../classes/SpritePool";

export class SpritePoolScenePlugin extends Phaser.Plugins.ScenePlugin {
  pools: Map<
    SpriteClass<Phaser.GameObjects.Sprite>,
    SpritePool<Phaser.GameObjects.Sprite>
  >;

  constructor(
    ...args: ConstructorParameters<typeof Phaser.Plugins.ScenePlugin>
  ) {
    super(...args);
    this.pools = new Map<
      SpriteClass<Phaser.GameObjects.Sprite>,
      SpritePool<Phaser.GameObjects.Sprite>
    >();
  }

  destroy(): void {
    for (const [_key, pool] of this.pools) {
      pool.destroy();
    }

    this.pools.clear();
  }

  releaseAll(
    property?: string,
    value?: any,
    classType = Phaser.GameObjects.Sprite
  ) {
    this.getPool(classType).releaseAll(property, value);
  }

  release<T extends Phaser.GameObjects.Sprite>(
    s: T,
    classType = Phaser.GameObjects.Sprite
  ) {
    this.getPool(classType).release(s);
  }

  get<T extends Phaser.GameObjects.Sprite>(
    x: number,
    y: number,
    classType = Phaser.GameObjects.Sprite
  ) {
    return this.getPool(classType).getOne(x, y) as T;
  }

  private getPool<T extends Phaser.GameObjects.Sprite>(
    classType: SpriteClass<T>
  ): SpritePool<T> {
    if (!this.pools.has(classType)) {
      this.pools.set(classType, new SpritePool<T>(this.scene, classType));
    }

    return this.pools.get(classType) as SpritePool<T>;
  }
}
