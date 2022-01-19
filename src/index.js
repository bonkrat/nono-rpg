import Phaser from "phaser";
import { puzzles } from "./puzzles";
import Battle from "./scenes/battle";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  scene: () => new Battle(puzzles[0]),
  pixelArt: true,
};

const game = new Phaser.Game(config);
