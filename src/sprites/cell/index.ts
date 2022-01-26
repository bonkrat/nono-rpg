import { shuffle } from "lodash";
import Phaser from "phaser";
import Battle from "../../scenes/battle";

export default class Cell extends Phaser.GameObjects.Sprite {
  constructor(scene: Battle, x: number, y: number) {
    super(scene, x, y, "cell");
    this.type = "Cell";
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "cell",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const cell = new Cell(this.scene as Battle, x, y);
    for (var i = 0; i < 5; i++) {
      cell.anims.create({
        key: "empty_" + i,
        frames: this.scene.anims.generateFrameNumbers("cell", {
          frames: shuffle([0, 1, 2, 3, 4]),
        }),
        frameRate: 3,
        repeat: -1,
      });

      cell.anims.create({
        key: "selected_" + i,
        frames: this.scene.anims.generateFrameNumbers("cellSelected", {
          frames: shuffle([0, 1, 2, 3, 4]),
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    this.displayList.add(cell);
    this.updateList.add(cell);

    return cell;
  }
);
