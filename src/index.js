import Phaser from "phaser";
import { puzzles } from "./puzzles";
import Battle from "./scenes/battle";
import animals from "./puzzles/medium/animals";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  //   scene: () => new Battle({ puzzles }),
  scene: () => new Battle(animals[0]),
  pixelArt: true,
};

const game = new Phaser.Game(config);
