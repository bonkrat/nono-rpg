declare interface IMiniGrid extends Phaser.GameObjects.Container {
  add(cell: ICell | ICell[]): void;
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    minigrid(x: number, y: number, puzzle: Puzzle): IMiniGrid;
  }
}
