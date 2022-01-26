import Battle from "../../src/scenes/battle";

export interface Cell {
  selected: boolean;
  color: string;
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
    Phaser.GameObjects.Sprite {
  state: CellState;
}

export class CellContainer extends Phaser.GameObjects.Container {
  constructor(scene: Battle, x?: number, y?: number, children?: CellSprite[]) {
    super(scene, x, y, children);
  }
  getAll(
    property?: string,
    value?: any,
    startIndex?: number,
    endIndex?: number
  ): CellSprite[];
  getAt(index: number): CellSprite;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Player extends Coordinates {
  health: number;
  hearts: number;
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

export interface BattleState {
  cells: CellSprite[][];
  dragging: Phaser.GameObjects.Group<CellSprite>;
  puzzle: Puzzle;
  player: Player;
  currentPuzzleIndex: number;
  currentNonogram: Nonogram;
  currentPuzzleSection: number = 0;
  completedPuzzles: number[];
  rowClues: Phaser.GameObjects.Sprite[][];
  colClues: Phaser.GameObjects.Sprite[][];
  cellContainer: CellContainer;
  minigrids: MiniGrid[];
}

export interface BattleStateManager extends Phaser.Data.DataManager {
  values: { [k in keyof BattleState]: BattleState[k] };
  set(key: keyof BattleState, value: BattleState[keyof BattleState]): void;
  set({}: {
    [k in keyof BattleState]?: BattleState[k];
  }): void;
  get<T extends keyof BattleState>(key: T): BattleState[T];
  getAll(): BattleState;
}
