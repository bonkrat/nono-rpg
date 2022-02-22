import { random } from "lodash";

export function pickRandom<T>(arr: Array<T>) {
  return arr[random(arr.length - 1)];
}
