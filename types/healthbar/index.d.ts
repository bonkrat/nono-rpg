declare interface IHealthBar extends Phaser.GameObjects.Container {
  setHealth(healthAmount: number): void;
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    healthbar(x: number, y: number, healthAmount: number): IHealthBar;
  }
}

declare interface IHealthCap extends Phaser.GameObjects.Sprite {}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    healthcap(x: number, y: number): IHealthCap;
  }
}

declare interface IHealthChunk extends Phaser.GameObjects.Sprite {}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    healthchunk(x: number, y: number): IHealthChunk;
  }
}
