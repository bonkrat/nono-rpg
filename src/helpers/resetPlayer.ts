import { setCompletedRowsAndColumns, checkPuzzle } from ".";
import { CellContainer, Player } from "../../types/puzzle";
import Battle from "../scenes/battle";
import { scale, width, height } from "../scenes/battle/constants";

export function resetPlayer(scene: Battle, cellcontainer: CellContainer) {
  for (const k in scene?.keys) {
    scene.keys[k].removeAllListeners();
  }

  scene.playerSprite.setVisible(true);

  scene.battleState.set("player", {
    currentCell: { x: 0, y: 0 },
  } as Player);

  // player.currentCell = { x: 0, y: 0 };
  scene.playerSprite.setPosition(cellcontainer.x, cellcontainer.y);

  // Player Controls
  scene.keys?.select.on("down", () => {
    const player = scene.battleState.get("player");
    const cells = scene.battleState.get("cells");
    const c = cells[player.currentCell.x][player.currentCell.y];
    scene.setCellHoverStyles(c);
    scene.battleState.get("dragging").push(c);
  });

  scene.keys?.select.on("up", () => {
    const dragging = scene.battleState.get("dragging");

    dragging.map((c, i, arr) => {
      // Only one in the dragged cells, so just inverse it!
      c.selected = arr.length > 1 ? true : !c.selected;
      c.dragging = false;

      c.setAlpha(0.5);

      setCompletedRowsAndColumns(scene, scene.battleState, scale);

      scene.tweens.add({
        targets: c,
        alpha: 1,
        ease: "Stepped",
        delay: 500 / (i + 1),
        scale: scale,
        onStart: () => {
          if (c.selected) {
            scene.emitter?.explode(6, c.x, c.y);
            if (arr.length > 1) {
              scene.cameras.main.shake(600 / (i + 1), 0.02 / (i + 1));
            }
          }
        },
        onComplete: () => {
          c.setCrop(0, 0, 32, 32);
        },
      });

      c.play(
        c.selected ? scene.getSelectedAnimation() : scene.getEmptyAnimation()
      );
    });

    scene.battleState.set("dragging", []);

    // Check for solved puzzle and build next if it is solved
    checkPuzzle(scene, scene.battleState, width, height);
  });
}
