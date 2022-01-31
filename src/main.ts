import Phaser from "phaser";
import Battle from "./scenes/battle";
import { Karen } from "./sprites/enemies/Karen";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  scene: new Battle({}, Karen),
  pixelArt: true,
};

new Phaser.Game(config);
