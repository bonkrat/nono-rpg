import Phaser from "phaser";
import Battle from "./scenes/battle";
import Enemies from "./sprites/enemies/index";

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  parent: "nono-rpg",
  width,
  height,
  scene: Enemies.map(
    (clazz: EnemyClass) => new Battle({ key: clazz.name }, clazz)
  ).reverse(),
  pixelArt: true,
};

new Phaser.Game(config);
