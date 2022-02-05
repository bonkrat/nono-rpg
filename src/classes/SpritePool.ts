/**
 * Allows you to reuse sprites from a pool for memory effeciency.
 *
 * maxSize and defaultKey are required in the config
 */
export class SpritePool extends Phaser.GameObjects.Group {
  constructor(
    scene: Phaser.Scene,
    config: RequireAtLeast<
      Phaser.Types.GameObjects.Group.GroupConfig,
      "maxSize" | "defaultKey"
    >,
    children?:
      | Phaser.GameObjects.GameObject[]
      | Phaser.Types.GameObjects.Group.GroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig
  ) {
    super(scene, children, config);

    this.createMultiple({
      active: false,
      visible: false,
      key: this.defaultKey,
      repeat: this.maxSize - 1,
    });

    return this;
  }

  activateSprite(s: Phaser.GameObjects.Sprite) {
    s.setActive(true);
    return s;
  }

  removeSprite(s: Phaser.GameObjects.Sprite) {
    this.killAndHide(s);
  }

  killAndHideAll() {
    this.getChildren().forEach((s) => this.killAndHide(s));
  }

  addSprite(x: number, y: number) {
    const s = this.get(x, y);

    if (!s) {
      console.warn("Already at max amount of " + this.defaultKey + " sprites!");
      return;
    }

    return this.activateSprite(s);
  }
}
