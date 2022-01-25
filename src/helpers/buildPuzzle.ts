import { setCompletedRowsAndColumns } from ".";
import {
  BattleStateManager,
  CellContainer,
  CellSprite,
} from "../../types/puzzle";
import type Battle from "../scenes/battle";

export default function (
  scene: Battle,
  battleState: BattleStateManager,
  width: number,
  height: number,
  scale: number
): CellContainer {
  const { puzzle, currentPuzzleSection } = battleState.values;

  const puzz = puzzle.puzzles[currentPuzzleSection];
  const middle = width - puzz.width * 32 * scale;
  const bottom = height - puzz.height * 32 * scale;

  const container = scene.add.container(middle, bottom);
  const cellContainer = scene.add.container(
    container.x,
    container.y
  ) as CellContainer;

  // Create emitter
  const particles = scene.add.particles("cellSelected");

  scene.emitter = particles.createEmitter({
    frame: 0,
    lifespan: 1000,
    speed: 600,
    //   alpha: { start: 1, end: 0 },
    gravityY: 2000,
    scale: { start: scale, end: 0.5 },
    rotate: { start: 0, end: 360, ease: "Power2" },
    //   blendMode: "ADD",
    on: false,
  });

  cellContainer.add(particles);
  // minigrid.add(this.minigridparticles);

  // Print row clues
  battleState.set({
    rowClues: puzz.rowClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = scene.add.sprite(
          -32 * j * scale - 64,
          32 * i * scale - 32 / 4,
          "clue"
        );

        container.add(clueSprite);
        clueSprite.play("number_" + clue);

        return clueSprite;
      });
    }),
  });

  // Print header clues
  battleState.set({
    colClues: puzz.colClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = scene.add.sprite(
          32 * i * scale,
          0 - 32 * scale - j * scale * 32 - 32 / 4,
          "clue"
        );

        clueSprite.play("number_" + clue);
        container.add(clueSprite);

        return clueSprite;
      });
    }),
  });

  // Print cells
  let cells: CellSprite[][] = [];
  for (var i = 0; i < puzz.height; i++) {
    for (var j = 0; j < puzz.width; j++) {
      const cell = scene.add.sprite(32 * i * scale, 32 * j * scale, "cell");
      if (!cells[j]) {
        cells[j] = [];
      }

      cells[j][i] = cell as CellSprite;

      cellContainer.add(cell);

      cell.setScale(scale);
      cell.play(scene.getEmptyAnimation());
    }
  }

  battleState.set("cells", cells);

  // Print hint
  puzz.hint?.cells.forEach((c, i) => {
    const cell =
      puzz.hint.direction === "col"
        ? cells[i][puzz.hint.index]
        : cells[puzz.hint.index][i];

    if (c.selected) {
      scene.fillCell(cell, i, scale);
    }
  });

  setCompletedRowsAndColumns(scene, battleState, scale);

  battleState.set({ cellContainer });

  return cellContainer;
}
