import Phaser from "phaser";
import { Cell } from "..";
import type Battle from "../../scenes/battle";
import { scale } from "../../scenes/battle/constants";

export class MiniGrid extends Phaser.GameObjects.Container {
  constructor(scene: Battle, x: number, y: number, puzzle?: Puzzle) {
    super(scene, x, y);

    if (puzzle) {
      this.add(
        puzzle.puzzles.map((_p: NonogramData, i: number) => {
          const s = scene.add
            .cell(
              i === 0 || i === 2
                ? 0
                : 32 * (scale / (puzzle.puzzles.length / 2)),
              i === 0 || i === 1
                ? 0
                : 32 * (scale / (puzzle.puzzles.length / 2))
            )
            .setOrigin(0, 0)
            .playEmptyAnimation();

          puzzle.puzzles.length > 1
            ? s.setScale(scale / (puzzle.puzzles.length / 2))
            : s.setScale(scale);
          return s;
        })
      );

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
