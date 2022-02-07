import Phaser from "phaser";
import { Battle } from "./scenes/battle";
import { GameOver } from "./scenes/gameover";
import { Pause } from "./scenes/pause";
import { Start } from "./scenes/start";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  scene: [Start, Battle, Pause, GameOver],
  scale: {
    mode: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  pixelArt: true,
};

new Phaser.Game(config);
