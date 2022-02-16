import Phaser from "phaser";
import { Battle } from "./scenes/battle";
import { GameOver } from "./scenes/gameover";
import { Introduction } from "./scenes/introduction";
import { Pause } from "./scenes/pause";
import { Start } from "./scenes/start";

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  scene: [Start, Battle, Pause, Introduction, GameOver],
  scale: {
    mode: Phaser.Scale.FIT,
  },
  pixelArt: true,
};

new Phaser.Game(config);
