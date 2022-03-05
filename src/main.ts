import Phaser from "phaser";
import { SpritePoolScenePlugin } from "./plugins/SpritePoolScenePlugin";
import { Battle } from "./scenes/battle";
import { GameOver } from "./scenes/gameover";
import { Introduction } from "./scenes/introduction";
import { Pause } from "./scenes/pause";
import { Controller } from "./scenes/controller";
import { GameStatePlugin } from "./plugins/GameStatePlugin";
import { End } from "./scenes/end";

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  plugins: {
    global: [
      {
        key: "GameStatePlugin",
        plugin: GameStatePlugin,
        start: true,
        mapping: "gamestate",
      },
    ],
    scene: [
      {
        key: "SpritePool",
        plugin: SpritePoolScenePlugin,
        mapping: "spritepool",
      },
    ],
  },
  scene: [Controller, Battle, Pause, Introduction, GameOver, End],
  scale: {
    mode: Phaser.Scale.FIT,
  },
  pixelArt: true,
};

new Phaser.Game(config);
