type PNG = string;

declare module "*.png" {
  const value: PNG;
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

type Constructor<T, P = any> = new (...params: P) => T;

interface EnemyClass
  extends Constructor<
    import("./sprites/enemies/enemy").Enemy,
    ConstructorParameters<typeof import("./sprites/enemies/enemy").Enemy>
  > {
  assets: Partial<Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig>[];
  puzzleSet: PuzzleSet;
  displayName: string;
  introduction: string[];
  description: string;
  dialogue: string[];
}

interface MobConfig extends Omit<EnemyClass, Constructor<EnemyClass>> {
  attack(): Enemy;
}

interface SpriteClass<T extends Phaser.GameObjects.Sprite> {
  new (...params: ConstructorParameters<T>): T;
}

declare module Phaser {
  export interface Scene {
    spritepool: import("./plugins/SpritePoolScenePlugin").SpritePoolScenePlugin;
  }

  declare module GameObjects {
    export interface GameObjectFactory {
      nonogram(
        nonogramData: NonogramData,
        scale: number
      ): import("./sprites/nonogram").Nonogram;
      cell(x: number, y: number, scale?: number): Cell;
      healthbar(x: number, y: number, healthAmount: number): HealthBar;
      healthcap(x: number, y: number): HealthCap;
      healthchunk(x: number, y: number): HealthChunk;
      minigrid(x: number, y: number, puzzle: Puzzle, scale: number): MiniGrid;
      player(x: number, y: number): Player;
      textsprite(
        text: string,
        scale?: number,
        tint?: number,
        curve?: Phaser.Curves.Curve
      ): Promise<import("./sprites/text").TextSprite>;
      enemy(
        EnemyClass: EnemyClass
      ): Promise<import("./sprites/enemies/enemy").Enemy>;
    }
  }
}

type Loadable = new (...args: any[]) => any;

type RequireAtLeast<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

interface Container<T> extends Phaser.GameObjects.Container {
  getAll(): T[];
}

type WordContainer = Container<Phaser.GameObjects.Sprite>;
type TextContainer = Container<WordContainer>;
