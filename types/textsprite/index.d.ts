declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    textsprite(
      text: string,
      x: number,
      y: number,
      scale: number
    ): Phaser.GameObjects.Sprite[];
  }
}
