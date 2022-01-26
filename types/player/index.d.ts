declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    player(x: number, y: number): Player;
  }
}
