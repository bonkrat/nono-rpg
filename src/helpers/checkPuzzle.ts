import { addText, buildPuzzle, resetPlayer } from ".";
import {
  BattleStateManager,
  CellContainer,
  MiniGrid,
  Puzzle,
  CellSprite,
  Player,
} from "../../types/puzzle";
import { CellState } from "../common";

import Battle from "../scenes/battle";
import { scale } from "../scenes/battle/constants";

export default function (
  scene: Battle,
  battleState: BattleStateManager,
  width: number,
  height: number
) {
  const {
    puzzle,
    currentPuzzleSection,
    currentNonogram,
    player,
    rowClues,
    completedPuzzles,
    currentPuzzleIndex,
    colClues,
    cellContainer,
    minigrids,
  } = battleState.values;

  if (scene.isPuzzzleSolved(currentNonogram)) {
    scene.keys?.select.removeAllListeners();
    scene.playerSprite.setVisible(false);
    rowClues?.map((r) => r.map((c) => c.setVisible(false)));
    colClues?.map((r) => r.map((c) => c.setVisible(false)));
    const solvedContainer = cellContainer;
    let currentMinigrid;
    if (minigrids) {
      currentMinigrid = minigrids[currentPuzzleIndex];
    }
    const currentPuzz = scene.puzzleSet[currentPuzzleIndex];
    const currentPuzzSection = currentPuzzleSection + 1;

    // Reset Player health

    scene.battleState.set("player", {
      x: 0,
      y: 0,
      health: 5,
      hearts: scene.battleState.get("player").hearts,
    } as Player);

    // Reset current puzzle
    if (currentPuzzSection === currentPuzz.puzzles.length) {
      battleState.set({
        currentPuzzleSection: 0,
        completedPuzzles: [...completedPuzzles, currentPuzzleIndex],
      });

      if (completedPuzzles.length === scene.puzzleSet.length) {
        console.log("BATTLE OVER!");
      }

      const unfinishedPuzzlesIndexes = scene.puzzleSet
        .map((p, i) => i)
        .filter((p, i) => !completedPuzzles.includes(i));

      const randomPuzzleIndex =
        unfinishedPuzzlesIndexes[
          Math.floor(Math.random() * unfinishedPuzzlesIndexes.length)
        ];

      battleState.set({
        puzzle: scene.puzzleSet[randomPuzzleIndex],
        currentPuzzleIndex: randomPuzzleIndex,
        currentNonogram: scene.puzzleSet[randomPuzzleIndex].puzzles[0],
      });
    } else {
      battleState.set({
        currentPuzzleSection: battleState.values.currentPuzzleSection + 1,
        currentNonogram:
          battleState.values.puzzle.puzzles[currentPuzzleSection + 1],
      });
    }

    scene.time.delayedCall(
      1000,
      () => {
        const cellContainer = buildPuzzle(
          scene,
          scene.battleState,
          width,
          height,
          scale
        );
        scene.battleState.set({ cellContainer });
        resetPlayer(scene, cellContainer);
      },
      [],
      scene
    );

    scene.time.delayedCall(
      1000,
      (
        cellcontainer: CellContainer,
        minigrid: MiniGrid,
        currentPuzz: Puzzle,
        currentPuzzleSection: number
      ) => {
        const path = { t: 0, vec: new Phaser.Math.Vector2() };
        const startPoint = new Phaser.Math.Vector2(
          cellcontainer.x,
          cellcontainer.y
        );
        var controlPoint1 = new Phaser.Math.Vector2(
          cellcontainer.x + 300,
          cellcontainer.y - 300
        );
        var controlPoint2 = new Phaser.Math.Vector2(
          cellcontainer.x + 100,
          cellcontainer.y - 300
        );
        var endPoint = new Phaser.Math.Vector2(
          minigrid.x,
          minigrid.y - (32 * scale) / 2
        );
        var curve = new Phaser.Curves.CubicBezier(
          startPoint,
          controlPoint1,
          controlPoint2,
          endPoint
        );

        cellcontainer
          .getAll()
          .forEach(
            (c: CellSprite) => c.state !== CellState.selected && c.destroy()
          );

        scene.tweens.add({
          targets: path,
          t: 1,
          ease: "Sine.easeInOut",
          duration: 1000,
          onUpdate: () => {
            curve.getPoint(path.t, path.vec);
            cellcontainer.x = path.vec.x;
            cellcontainer.y = path.vec.y;
          },
        });

        scene.tweens.add({
          targets: cellcontainer,
          duration: 500,
          scale: scale / 10 / Math.sqrt(currentPuzz.puzzles.length),
          onComplete: () => {
            scene.time.delayedCall(
              1500,
              (
                currentPuzzleSection: number,
                puzzleLength: number,
                puzzleName: string
              ) => {
                const offset = 5;
                if (currentPuzzleSection > 0) {
                  cellcontainer.x =
                    minigrid.x +
                    minigrid.getAt(currentPuzzleSection - 1).x +
                    offset;
                  cellcontainer.y =
                    minigrid.y +
                    minigrid.getAt(currentPuzzleSection - 1).y +
                    offset;
                } else {
                  cellcontainer.x = minigrid.x + minigrid.getAt(0).x + offset;
                  cellcontainer.y = minigrid.y + minigrid.getAt(0).y + offset;
                }

                scene.emitter?.explode(32, cellcontainer.x, cellcontainer.y);
                scene.cameras.main.shake(200);

                if (currentPuzzleSection === puzzleLength) {
                  minigrid.setVisible(false);
                  addText(
                    scene,
                    puzzleName,
                    minigrid.x + minigrid.x / 4,
                    minigrid.y - 32 + 32 / 2,
                    scale / 4
                  );
                }
              },
              [
                currentPuzzleSection,
                currentPuzz.puzzles.length,
                currentPuzz.name,
              ],
              scene
            );
          },
        });
      },
      [solvedContainer, currentMinigrid, currentPuzz, currentPuzzSection],
      scene
    );
  }
}
