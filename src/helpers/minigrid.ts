import { PuzzleSet } from "../../types/puzzle";
import type Battle from "../scenes/battle";

export function buildMinigrid(
  scene: Battle,
  ...args: [number, number, number, PuzzleSet]
): IMiniGrid[] {
  const [height, width, scale, puzzleSet] = args;
  // const margin = (32 * scale * (index + 1)) / 2;
  const bottomAlign = (x: number) => x + height - 32 * scale - 32 * scale;
  const leftAlign = (x: number) => x + 32;

  return puzzleSet.map((puzz, index) => {
    const margin = 10 * index;
    const minigrid = scene.add.minigrid(
      leftAlign(
        puzzleSet.length * scale +
          32 * scale * index +
          margin * scene.puzzleSet.length
      ),
      bottomAlign(32),
      puzz
    );

    return minigrid;
  });
}
