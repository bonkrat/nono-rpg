import { isEqual } from "lodash";
import { BattleStateManager } from "../../types/puzzle";
import type Battle from "../scenes/battle";
import generateClues from "./generateClues";

export default function (
  scene: Battle,
  battleState: BattleStateManager,
  scale: number
) {
  const { currentNonogram, cells } = battleState.values;

  if (!scene.isPuzzzleSolved(currentNonogram)) {
    // Rows first
    const rowClues: number[][] = [];

    cells.map((row) => {
      const selected = row.reduce((acc: number[], curr, index) => {
        if (curr.selected) {
          acc.push(index);
        }
        return acc;
      }, []);
      rowClues.push(generateClues(selected));
    });

    currentNonogram.rowClues.forEach((r, i) => {
      if (isEqual(r, rowClues[i])) {
        cells[i].forEach((c) => {
          if (!c.selected) {
            c.disabled = true;
            scene.setCellDisabledStyles(c, scale);
          }
        });
      } else {
        cells[i].forEach((c) => {
          if (!c.selected) {
            c.disabled = false;
            scene.setCellEmptyStyles(c, scale);
          }
        });
      }
    });

    // Then Columns
    const colClues: number[][] = [];

    for (var i = 0; i < currentNonogram.width; i++) {
      const colData = cells.map((row) => row[i]);
      const selectedColCell = colData.reduce((acc: number[], curr, index) => {
        if (curr.selected) {
          acc.push(index);
        }
        return acc;
      }, []);
      colClues.push(generateClues(selectedColCell));
    }

    currentNonogram.colClues.forEach((r, i) => {
      const colData = cells.map((row) => row[i]);

      if (isEqual(r, colClues[i])) {
        colData.forEach((c) => {
          if (!c.selected) {
            c.disabled = true;
            scene.setCellDisabledStyles(c, scale);
          }
        });
      } else {
        colData.forEach((c) => {
          if (!c.selected && !c.disabled) {
            scene.setCellEmptyStyles(c, scale);
          }
        });
      }
    });
  }
}
