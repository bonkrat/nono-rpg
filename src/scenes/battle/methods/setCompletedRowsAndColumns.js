import { isEqual } from "lodash";
import generateClues from "../generateClues";

export default function (scale) {
  if (!this.isPuzzzleSolved(this.puzzle.puzzles[this.currentPuzzleSection])) {
    // Rows first
    const rowClues = [];

    this.cells.map((row) => {
      const selected = row.reduce((acc, curr, index) => {
        if (curr.selected) {
          acc.push(index);
        }
        return acc;
      }, []);
      rowClues.push(generateClues(selected));
    });

    this.puzzle.puzzles[this.currentPuzzleSection].rowClues.forEach((r, i) => {
      if (isEqual(r, rowClues[i])) {
        this.cells[i].forEach((c) => {
          if (!c.selected) {
            c.disabled = true;
            this.setCellDisabledStyles(c, scale);
          }
        });
      } else {
        this.cells[i].forEach((c) => {
          if (!c.selected) {
            c.disabled = false;
            this.setCellEmptyStyles(c, scale);
          }
        });
      }
    });

    // Then Columns
    const colClues = [];
    for (
      var i = 0;
      i < this.puzzle.puzzles[this.currentPuzzleSection].width;
      i++
    ) {
      const colData = this.cells.map((row) => row[i]);
      const selectedColCell = colData.reduce((acc, curr, index) => {
        if (curr.selected) {
          acc.push(index);
        }
        return acc;
      }, []);
      colClues.push(generateClues(selectedColCell));
    }

    this.puzzle.puzzles[this.currentPuzzleSection].colClues.forEach((r, i) => {
      const colData = this.cells.map((row) => row[i]);

      if (isEqual(r, colClues[i])) {
        colData.forEach((c) => {
          if (!c.selected) {
            this.setCellDisabledStyles(c, scale);
          }
        });
      } else {
        colData.forEach((c) => {
          if (!c.selected && !c.disabled) {
            this.setCellEmptyStyles(c, scale);
          }
        });
      }
    });
  }
}
