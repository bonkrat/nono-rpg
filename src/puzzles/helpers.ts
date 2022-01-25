import { Nonogram, CellSprite } from "../../types/puzzle";
import { CellState } from "../common";

export function isValidPuzzle(puzzle: Nonogram, cells: CellSprite[][]) {
  const { width, height } = puzzle,
    rows = cells.map((row) =>
      row.map((cell) => cell?.state == CellState.selected)
    );
  let valid = true;

  // Validate each column
  for (var i = 0; i < width; i++) {
    const col = getColumnValues(rows, i, height);
    if (!isValidOrder(col, puzzle.colClues[i], height)) {
      console.log("invalid column", i, col);
      console.log("invalid column clues", puzzle.colClues[i]);
      valid = false;
      break;
    }
  }

  if (valid) {
    // Validate each row
    for (var i = 0; i < height; i++) {
      if (!isValidOrder(rows[i], puzzle.rowClues[i], width)) {
        console.log("invalid row ", i, rows[i]);
        console.log("row clues", puzzle.rowClues[i]);

        valid = false;
        break;
      }
    }
  }

  return valid;
}

/**
 * Validates cells are in a valid order according to clues. Does not guarantee completeness, just that nothing invalid is set.
 * Builds a regexp like ^O{0,}(X{0,2}$|X{2}(X{0,2}$|O{1,}X{1})(X{0,2}$|O{1,}X{1})O{0,})$ for [2, 1, 1]
 *
 * @param rowIndex {number} This is the number of values in the column to validate up to. Should match the size of the stack of currently generated rows.
 */
export function isValidOrder(
  col: boolean[],
  columnClues: number[],
  rowIndex: number
) {
  // Row index is used to validate that a column is valid up until the current row.
  const column = col.slice(0, rowIndex);

  if (columnClues.includes(0) && column.includes(true)) return false;

  const matcherString = column
    .map((selected) => (selected ? "X" : "O"))
    .join("");

  let regexString = "";
  if (columnClues.length === 1) {
    const clue = columnClues[0];
    regexString = `^O{0,}X{0,${clue}}O{0,}$`;
  } else {
    regexString += "^O{0,}(";

    regexString.concat(
      ...columnClues.map((clue, index, arr) => {
        if (index > 0) {
          regexString += `X{0,${clue}}$|X{${clue}}O{1,})`;
          if (index < arr.length - 1) {
            regexString += "(";
          }
        } else {
          regexString += `X{0,${clue}}$|X{${clue}}O{1,}(`;
        }

        return regexString;
      })
    );

    regexString += "O{0,})$";
  }

  return new RegExp(regexString).test(matcherString);
}

/**
 * Builds up an array of the currently selected column values.
 */
export function getColumnValues(
  rowStack: boolean[][],
  columnIndex: number,
  height: number
) {
  return Array.from({
    ...rowStack.map((row) => row[columnIndex]),
    length: height,
  }).map((v) => v ?? false);
}
