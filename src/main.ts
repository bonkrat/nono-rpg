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
  scene: function () {
    return new Battle({}, [animals[0], puzzles[0], puzzles[1]]);
  },
  pixelArt: true,
};

new Phaser.Game(config);
