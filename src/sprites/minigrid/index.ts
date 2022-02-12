import { chunk, flattenDeep } from "lodash";
import Phaser from "phaser";
import { Cell } from "..";
import { Battle } from "../../scenes/battle";

export class MiniGrid extends Phaser.GameObjects.Container {
  cellScale!: number;

  constructor(
    scene: Battle,
    x: number,
    y: number,
    puzzle: Puzzle,
    scale: number
  ) {
    super(scene, x, y);

    this.cellScale =
      puzzle.puzzles.length > 1
        ? scale / (puzzle.puzzles.length / Math.sqrt(puzzle.puzzles.length))
        : scale;

    if (puzzle) {
      const grid = flattenDeep(
        chunk(puzzle.puzzles, Math.sqrt(puzzle.puzzles.length)).map(
          (row, x) => {
            return row.map((_c, y) => {
              const s = scene.add
                .cell(
                  y * 32 * this.cellScale,
                  x * 32 * this.cellScale,
                  this.cellScale
                )
                .setOrigin(0, 0)
                .playEmptyAnimation();

              return s as Cell;
            });
          }
        )
      );

      this.add(grid);
      this.setAlpha(0.5);
    }
  }

  getAt(index: number): Cell {
    return super.getAt(index) as Cell;
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "minigrid",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    puzzle: Puzzle,
    scale: number
  ) {
    const minigrid = new MiniGrid(this.scene as Battle, x, y, puzzle, scale);

    this.displayList.add(minigrid);

    return minigrid;
  }
);
