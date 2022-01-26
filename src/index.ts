import Phaser from "phaser";
import { puzzles } from "./puzzles";
import Battle from "./scenes/battle";
import animals from "./puzzles/medium/animals";
import { BattleStateManagerPlugin } from "./scenes/battle/BattleState";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  plugins: {
    scene: [
      {
        mapping: "battleState",
        key: "battleState",
        plugin: BattleStateManagerPlugin,
      },
    ],
  },
  scene: () => new Battle({}, [animals[0], puzzles[0], puzzles[1]]),
  // scene: () => new Battle({}, [puzzles[0]]),
  pixelArt: true,
};

const game = new Phaser.Game(config);
