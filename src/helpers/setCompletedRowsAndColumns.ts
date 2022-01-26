import { isEqual } from "lodash";
import { BattleStateManager } from "../../types/puzzle";
import { CellState } from "../common";
import type Battle from "../scenes/battle";
import generateClues from "./generateClues";

export default function (
  scene: Battle,
  battleState: BattleStateManager,
  scale: number
) {
  const { currentNonogram } = battleState.values;

  if (!scene.nonogram?.isPuzzleSolved()) {
    // Rows first
    const rowClues: number[][] = [];

    const nonogram = scene.nonogram;

    if (nonogram) {
      const rows = nonogram.getRows();
      const cols = nonogram.getColumns();

      rows.map((row) => {
        const selected = row.reduce((acc: number[], curr, index) => {
          if (curr.state === CellState.selected) {
            acc.push(index);
          }
          return acc;
        }, []);
        rowClues.push(generateClues(selected));
      });

      currentNonogram.rowClues.forEach((r, i) => {
        if (isEqual(r, rowClues[i])) {
          rows[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setState(CellState.disabled);
              scene.setCellDisabledStyles(c, scale);
            }
          });
        } else {
          rows[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setState(CellState.disabled);
              scene.setCellEmptyStyles(c, scale);
            }
          });
        }
      });

      // Then Columns
      const colClues: number[][] = [];

      cols.map((col) => {
        const selected = col.reduce((acc: number[], curr, index) => {
          if (curr.state === CellState.selected) {
            acc.push(index);
          }
          return acc;
        }, []);
        colClues.push(generateClues(selected));
      });

      currentNonogram.colClues.forEach((r, i) => {
        if (isEqual(r, colClues[i].reverse())) {
          cols[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setState(CellState.disabled);
              scene.setCellDisabledStyles(c, scale);
            }
          });
        } else {
          cols[i].forEach((c) => {
            if (![CellState.disabled, CellState.selected].includes(c.state)) {
              scene.setCellEmptyStyles(c, scale);
            }
          });
        }
      });
    }
  }
}
