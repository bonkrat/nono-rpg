export interface Cell {
  disabled?: boolean;
  selected?: boolean;
  dragging?: boolean;
  color?: string;
}

export interface Nonogram {
  rowClues: number[][];
  colClues: number[][];
  hint: {
    direction: "col" | "row";
    index: number;
    cells: Cell[];
  };
  resultSha: string;
  height: number;
  width: number;
}

export interface Puzzle {
  name: string;
  puzzles: Nonogram[];
}

export type PuzzleSet = Puzzle[];
export interface CellSprite
  extends Phaser.GameObjects.GameObject,
    Phaser.GameObjects.Sprite,
    Cell {}

export interface CellContainer extends Phaser.GameObjects.Container {
  getAt(index: number): CellSprite;
  getAll(
    property?: string | undefined,
    value?: any,
    startIndex?: number | undefined,
    endIndex?: number | undefined
  ): CellSprite[];
}

type BattleKey = Phaser.Input.Keyboard.Key & {
  previousDuration?: number;
  firedOnce?: boolean;
};

export type Direction = "up" | "down" | "left" | "right";

type PlayerInput = Direction | "select";

type BattleKeys = {
  [s in PlayerInput as string]: BattleKey;
};

export interface MiniGrid extends CellContainer {}
