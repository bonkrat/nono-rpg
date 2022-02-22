import { Karen } from "./Karen";
import { DogWalker } from "./DogWalker";
import { Ghost } from "./Ghost";
import { pickRandom } from "../../utils";

const enemyClasses = [Karen, DogWalker, Ghost] as EnemyClass[];

export function getRandomEnemyClass() {
  return pickRandom(enemyClasses);
}

export default enemyClasses;
