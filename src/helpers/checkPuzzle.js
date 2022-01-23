import { scale } from "../scenes/battle/constants";

export default function (width, height) {
  if (this.isPuzzzleSolved(this.puzzle.puzzles[this.currentPuzzleSection])) {
    this.keys.select.removeAllListeners();
    this.player.setVisible(false);
    this.rowClues.map((r) => r.map((c) => c.setVisible(false)));
    this.colClues.map((r) => r.map((c) => c.setVisible(false)));
    const solvedContainer = this.cellcontainer;
    const currentMinigrid = this.minigrids[this.currentPuzzle];
    const currentPuzz = this.puzzleSet[this.currentPuzzle];
    const currentPuzzSection = this.currentPuzzleSection + 1;

    // Reset current puzzle
    if (currentPuzzSection === currentPuzz.puzzles.length) {
      this.currentPuzzleSection = 0;
      this.completedPuzzles.push(this.currentPuzzle);

      if (this.completedPuzzles.length === this.puzzleSet.length) {
        console.log("BATTLE OVER!");
      }

      const unfinishedPuzzlesIndexes = this.puzzleSet
        .map((p, i) => i)
        .filter((p, i) => !this.completedPuzzles.includes(i));

      const randomPuzzleIndex =
        unfinishedPuzzlesIndexes[
          Math.floor(Math.random() * unfinishedPuzzlesIndexes.length)
        ];

      this.puzzle = this.puzzleSet[randomPuzzleIndex];
      this.currentPuzzle = randomPuzzleIndex;
    } else {
      this.currentPuzzleSection += 1;
    }

    this.time.delayedCall(
      1000,
      () => {
        this.cellcontainer = this.buildPuzzle(width, height, scale);
        this.resetPlayer(this.cellcontainer);
      },
      [],
      this
    );

    this.time.delayedCall(
      1000,
      (cellcontainer, minigrid, currentPuzz, currentPuzzleSection) => {
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

        cellcontainer.getAll().map((c) => !c.selected && c.destroy());

        this.tweens.add({
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

        this.tweens.add({
          targets: cellcontainer,
          duration: 500,
          scale: scale / 10 / Math.sqrt(currentPuzz.puzzles.length),
          onComplete: () => {
            this.time.delayedCall(
              1500,
              (currentPuzzleSection, puzzleLength, puzzleName) => {
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

                this.emitter.explode(32, cellcontainer.x, cellcontainer.y);
                this.cameras.main.shake(200);

                if (currentPuzzleSection === puzzleLength) {
                  minigrid.setVisible(false);
                  this.addText(
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
              this
            );
          },
        });
      },
      [solvedContainer, currentMinigrid, currentPuzz, currentPuzzSection],
      this
    );
  }
}
