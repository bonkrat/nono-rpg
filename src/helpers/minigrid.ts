import { PuzzleSet, MiniGrid } from "../../types/puzzle";
import type Battle from "../scenes/battle";

export function buildMinigrid(
  scene: Battle,
  ...args: [number, number, number, PuzzleSet]
): MiniGrid[] {
  const [height, width, scale, puzzleSet] = args;
  // const margin = (32 * scale * (index + 1)) / 2;
  const bottomAlign = (x: number) => x + height - 32 * scale - 32 * scale;
  const leftAlign = (x: number) => x + 32;

  return puzzleSet.map((puzz, index) => {
    const margin = 10 * index;
    const minigrid = scene.add.container(
      leftAlign(
        puzzleSet.length * scale +
          32 * scale * index +
          margin * scene.puzzleSet.length
      ),
      bottomAlign(32)
    ) as MiniGrid;

    minigrid
      .add(
        puzz.puzzles.map((p, i) => {
          const s = scene.add
            .sprite(
              i === 0 || i === 2 ? 0 : 32 * (scale / (puzz.puzzles.length / 2)),
              i === 0 || i === 1 ? 0 : 32 * (scale / (puzz.puzzles.length / 2)),
              "cell"
            )
            .setOrigin(0, 0)
            .play(scene.getEmptyAnimation());

          puzz.puzzles.length > 1
            ? s.setScale(scale / (puzz.puzzles.length / 2))
            : s.setScale(scale);
          return s;
        })
      )
      .setAlpha(0.5);

    return minigrid;
  });
}
