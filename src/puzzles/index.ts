import animals from "./medium/animals";
import plants from "./medium/plants";
export { smallPuzzles } from "./small";
import letters from "./small/letters";

export const puzzles = [...letters, ...animals, ...plants];
