import { Karen } from "./Karen";
import { DogWalker } from "./DogWalker";
import { pickRandom } from "../../utils";
import { mobs } from "../../assets/sprites";

export const bosses = [Karen, DogWalker] as EnemyClass[];

export function getRandomBoss() {
  return pickRandom(bosses);
}

export function getRandomMobSprite() {
  return pickRandom(mobs);
}
