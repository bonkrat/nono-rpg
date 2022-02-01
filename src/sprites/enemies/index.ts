import { Karen } from "./Karen";
import { DogWalker } from "./DogWalker";
import { Ghost } from "./Ghost";
import { random } from "lodash";

const enemyClasses = [Karen, DogWalker, Ghost] as EnemyClass[];

export function getRandomEnemyClass() {
  return enemyClasses[random(enemyClasses.length - 1)];
}

export default enemyClasses;
