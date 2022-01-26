import { setCompletedRowsAndColumns, checkPuzzle } from ".";
import { CellContainer, CellSprite, Player } from "../../types/puzzle";
import { CellState } from "../common";
import Battle from "../scenes/battle";
import { scale, width, height } from "../scenes/battle/constants";

export function resetPlayer(scene: Battle, cellcontainer: CellContainer) {
  for (const k in scene?.keys) {
    scene.keys[k].removeAllListeners();
  }

  scene.playerSprite.setVisible(true);

  scene.battleState.set("player", {
    x: 0,
    y: 0,
    health: 5,
    hearts: scene.battleState.get("player").hearts,
  } as Player);

  scene.playerSprite.setPosition(cellcontainer.x, cellcontainer.y);

  // Player Controls
  scene.keys?.select.on("down", () => {
    const {
      player: { x, y },
      cells,
    } = scene.battleState.getAll();

    const c = cells[x][y];
    scene.setCellHoverStyles(c);
    scene.battleState.set("dragging", scene.battleState.values.dragging.add(c));
  });

  scene.keys?.select.on("up", () => {
    const dragging = scene.battleState.get("dragging");

    dragging.children.iterate((c: CellSprite, i: number) => {
      // Only one in the dragged cells, so just inverse it!
      if (dragging.getLength() > 1) {
        c.setState(CellState.selected);
      } else {
        c.setState(
          c.state === CellState.selected
            ? CellState.disabled
            : CellState.selected
        );
      }

      c.setAlpha(0.5);

      setCompletedRowsAndColumns(scene, scene.battleState, scale);

      scene.tweens.add({
        targets: c,
        alpha: 1,
        ease: "Stepped",
        delay: 500 / (i + 1),
        scale: scale,
        onStart: () => {
          if (c.state === CellState.selected) {
            scene.emitter?.explode(6, c.x, c.y);
            scene.cameras.main.shake(100);
          }
        },
        onComplete: (tween) => {
          scene.tweens.remove(tween);
          c.setCrop(0, 0, 32, 32);
        },
      });

      c.play(
        c.state === CellState.selected
          ? scene.getSelectedAnimation()
          : scene.getEmptyAnimation()
      );
    });

    scene.battleState.values.dragging.clear();

    // Check for solved puzzle and build next if it is solved
    checkPuzzle(scene, scene.battleState, width, height);
  });
}
