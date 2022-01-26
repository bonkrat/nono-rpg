declare interface Nonogram extends Phaser.GameObjects.Container {
  nonogramData: NonogramData;
  rowClues: Phaser.GameObjects.Sprite[][];
  colClues: Phaser.GameObjects.Sprite[][];
  addParticles(
    particles: Phaser.GameObjects.Particles.ParticleEmitterManager
  ): Nonogram;
  getCell(coords: Coordinates): ICell;
  getRows(): ICell[][];
  getColumns(): ICell[][];
  setCompletedRowsAndColumns(): void;
  buildClues(): { rowClues; colClues };
  isPuzzleSolved(): boolean;
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    nonogram(x: number, y: number, nonogramData: NonogramData): Nonogram;
  }
}

declare interface ICell extends Phaser.GameObjects.Sprite {
  state: CellState;
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    cell(x: number, y: number): ICell;
  }
}
