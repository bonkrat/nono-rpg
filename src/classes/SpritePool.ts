import { logger } from "../utils";

/**
 * Allows you to reuse sprites from a pool for memory effeciency.
 */
export class SpritePool<T extends Phaser.GameObjects.Sprite> extends Phaser
  .GameObjects.Group {
  constructor(scene: Phaser.Scene, classType: SpriteClass<T>) {
    super(scene);

    this.classType = classType || Phaser.GameObjects.Sprite;
    return this;
  }

  releaseAll(property?: string, value?: any) {
    if (property && value) {
      this.getMatching(property, value)
        .filter((s) => s.active)
        .forEach((s) => this.release(s));
    } else {
    }
    this.getMatching("active", true).forEach((s) => this.release(s));
  }

  release(s: T) {
    this.killAndHide(s);

    this.log("RELEASE", "pool size", this.getMatching("active", false).length);
  }

  getOne(x: number, y: number): T {
    const s = this.getFirst(false) as T;

    if (!s) {
      this.log("CREATE", "pool size", this.getLength() + 1);
      return this.create(x, y);
    }

    s.setPosition(x, y);
    s.setVisible(true);
    s.setActive(true);

    this.log("RESUSE", " pool size", this.getLength());

    return s;
  }

  private log(action: string, message: string, data: any) {
    logger.debug({ name: "SpriteLoader", action, message, data });
  }
}
