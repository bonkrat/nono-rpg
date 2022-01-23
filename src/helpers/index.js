import buildPuzzle from "./buildPuzzle";
import checkPuzzle from "./checkPuzzle";
import { buildMinigrid } from "./minigrid";
import { movePlayer } from "./movePlayer";
import setCompletedRowsAndColumns from "./setCompletedRowsAndColumns";
import * as textMethods from "./text";

export default {
  buildPuzzle,
  checkPuzzle,
  buildMinigrid,
  setCompletedRowsAndColumns,
  movePlayer,
  ...textMethods,
};
