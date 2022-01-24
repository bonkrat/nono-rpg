import { CellContainer } from "../../types/puzzle";
import type Battle from "../scenes/battle";

export default function (
  this: Battle,
  width: number,
  height: number,
  scale: number
): CellContainer {
  if (this.puzzle.puzzles && !this.currentPuzzleSection) {
    this.currentPuzzleSection = 0;
  }

  const puzz = this.puzzle.puzzles[this.currentPuzzleSection];
  const middle = width - puzz.width * 32 * scale;
  const bottom = height - puzz.height * 32 * scale;
  const container = this.add.container(middle, bottom);
  const cellcontainer = this.add.container(
    container.x,
    container.y
  ) as CellContainer;

  // Create emitter
  const particles = this.add.particles("cellSelected");

  this.emitter = particles.createEmitter({
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

  cellcontainer.add(particles);
  // minigrid.add(this.minigridparticles);

  // Print row clues
  this.rowClues = puzz.rowClues.map((clues, i) => {
    return clues.reverse().map((clue, j) => {
      const clueSprite = this.add.sprite(
        -32 * j * scale - 64,
        32 * i * scale - 32 / 4,
        "clue"
      );

      container.add(clueSprite);
      clueSprite.play("number_" + clue);

      return clueSprite;
    });
  });

  // Print header clues
  this.colClues = puzz.colClues.map((clues, i) => {
    return clues.reverse().map((clue, j) => {
      const clueSprite = this.add.sprite(
        32 * i * scale,
        0 - 32 * scale - j * scale * 32 - 32 / 4,
        "clue"
      );

      clueSprite.play("number_" + clue);
      container.add(clueSprite);

      return clueSprite;
    });
  });

  // Print cells
  for (var i = 0; i < puzz.height; i++) {
    for (var j = 0; j < puzz.width; j++) {
      const cell = this.add.sprite(32 * i * scale, 32 * j * scale, "cell");

      this.addCell(cell, j, i);
      cellcontainer.add(cell);

      cell.setScale(scale);
      cell.play(this.getEmptyAnimation());
    }
  }

  // Print hint
  puzz.hint?.cells.forEach((c, i) => {
    const cell =
      puzz.hint.direction === "col"
        ? this.cells[i][puzz.hint.index]
        : this.cells[puzz.hint.index][i];

    if (c.selected) {
      this.fillCell(cell, i, scale);
    }
  });

  this.setCompletedRowsAndColumns(scale);

  return cellcontainer;
}
