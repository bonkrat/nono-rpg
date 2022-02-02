import { chunk, flattenDeep } from "lodash";
import Phaser from "phaser";
import { Cell } from "..";
import { Battle } from "../../scenes/battle";
import { scale } from "../../scenes/battle/constants";

export class MiniGrid extends Phaser.GameObjects.Container {
  constructor(scene: Battle, x: number, y: number, puzzle?: Puzzle) {
    super(scene, x, y);

    if (puzzle) {
      const grid = flattenDeep(
        chunk(puzzle.puzzles, Math.sqrt(puzzle.puzzles.length)).map(
          (row, x) => {
            return row.map((_c, y) => {
              const cellScale =
                puzzle.puzzles.length > 1
                  ? scale /
                    (puzzle.puzzles.length / Math.sqrt(puzzle.puzzles.length))
                  : scale;

              const s = scene.add
                .cell(y * 32 * cellScale, x * 32 * cellScale)
                .setOrigin(0, 0)
                .setScale(cellScale)
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
    puzzle: Puzzle
  ) {
    const minigrid = new MiniGrid(this.scene as Battle, x, y, puzzle);

    this.displayList.add(minigrid);

    return minigrid;
  }
);
