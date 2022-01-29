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
  scene: function () {
    return new Battle({}, [animals[0], puzzles[0], puzzles[1]]);
  },
  // scene: () => new Battle({}, [puzzles[0]]),
  pixelArt: true,
};

const game = new Phaser.Game(config);

// const app = document.querySelector<HTMLDivElement>("#app")!;

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `;
