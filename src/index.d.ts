declare module "*.png" {
  const value: any;
  export default value;
}

interface CellData {
  selected: boolean;
  color: string;
}

interface NonogramData {
  rowClues: number[][];
  colClues: number[][];
  hint: {
    direction: "col" | "row";
    index: number;
    cells: CellData[];
  };
  resultSha: string;
  height: number;
  width: number;
}

interface Puzzle {
  name: string;
  puzzles: NonogramData[];
}

type PuzzleSet = Puzzle[];

interface Coordinates {
  x: number;
  y: number;
}

type BattleKey = Phaser.Input.Keyboard.Key & {
  previousDuration?: number;
  firedOnce?: boolean;
};

type Direction = "up" | "down" | "left" | "right";

type PlayerInput = Direction | "select";

type BattleKeys = {
  [s in PlayerInput as string]: BattleKey;
};

interface EnemyClass {
  new (
    ...params: ConstructorParameters<
      typeof import("./sprites/enemies/enemy").Enemy
    >
  ): import("./sprites/enemies/enemy").Enemy;
  puzzleSet: PuzzleSet;
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    nonogram(nonogramData: NonogramData): import("./sprites/nonogram").Nonogram;
    cell(x: number, y: number): Cell;
    healthbar(x: number, y: number, healthAmount: number): HealthBar;
    healthcap(x: number, y: number): HealthCap;
    healthchunk(x: number, y: number): HealthChunk;
    minigrid(x: number, y: number, puzzle: Puzzle): MiniGrid;
    player(x: number, y: number): Player;
    textsprite(
      text: string,
      x: number,
      y: number,
      scale: number
    ): Phaser.GameObjects.Container;
    enemy(
      EnemyClass: EnemyClass
    ): Promise<import("./sprites/enemies/enemy").Enemy>;
  }
}
