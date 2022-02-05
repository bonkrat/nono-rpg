import Phaser from "phaser";
import { Battle } from "./scenes/battle";
import { GameOver } from "./scenes/gameover";
import { Start } from "./scenes/start";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  scene: [Start, Battle, GameOver],
  pixelArt: true,
};

new Phaser.Game(config);
