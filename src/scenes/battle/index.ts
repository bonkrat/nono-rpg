import sha256 from "crypto-js/sha256";
import { shuffle } from "lodash";
import Phaser from "phaser";
import {
  BattleKeys,
  BattleState,
  BattleStateManager,
  CellSprite,
  MiniGrid,
  NonogramData,
  Puzzle,
  PuzzleSet,
} from "../../../types/puzzle";
import cell from "../../assets/sprites/cell.png";
import cellSelected from "../../assets/sprites/cell_selected.png";
import emptyHealthBar from "../../assets/sprites/empty_health_bar.png";
import emptyHealthCap from "../../assets/sprites/empty_health_cap.png";
import fullHealthBar from "../../assets/sprites/full_health_bar.png";
import fullHealthCap from "../../assets/sprites/full_health_cap.png";
import letters from "../../assets/sprites/letters.png";
import numbers from "../../assets/sprites/numbers.png";
import player from "../../assets/sprites/player.png";
import { CellState } from "../../common";
import { buildMinigrid } from "../../helpers";
import "../../sprites";
import type Nonogram from "../../sprites/nonogram";
import type Player from "../../sprites/player";

const width = 800;
const height = 600;
const scale = 2;

class Battle extends Phaser.Scene {
  public battleState!: BattleStateManager;
  public puzzleSet: PuzzleSet;
  public keys?: BattleKeys;
  public emitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  public healthbar!: IHealthBar;
  public timerEvents?: Phaser.Time.TimerEvent[];
  public player!: Player;
  public nonogram?: Nonogram;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    puzzleSet: PuzzleSet
  ) {
    super(config);
    this.puzzleSet = puzzleSet;
  }

  preload() {
    [
      ["cell", cell],
      ["cellSelected", cellSelected],
      ["numbers", numbers],
      ["player", player],
      ["letters", letters],
      ["fullHealthBar", fullHealthBar],
      ["fullHealthCap", fullHealthCap],
      ["emptyHealthBar", emptyHealthBar],
      ["emptyHealthCap", emptyHealthCap],
    ].forEach(([key, url]: string[]) => {
      this.load.spritesheet(key, url, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });
  }

  create() {
    this.battleState.set({
      dragging: this.add.group(),
      puzzle: this.puzzleSet[0],
      currentNonogram: this.puzzleSet[0].puzzles[0],
      currentPuzzleSection: 0,
      currentPuzzleIndex: 0,
      completedPuzzles: [],
    });

    // Setup keyboard controls
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      select: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as BattleKeys;

    // Create number animations
    for (var i = 0; i < 10; i++) {
      this.anims.create({
        key: "number_" + i,
        frames: this.anims.generateFrameNumbers("numbers", {
          frames: shuffle([i, i + 10, i + 20, i + 30]),
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Add minigrids
    this.battleState.set(
      "minigrids",
      buildMinigrid(this, height, width, scale, this.puzzleSet)
    );

    // Print picross puzzle
    const { puzzle, currentPuzzleSection } = this.battleState.values;

    const currPuzz = puzzle.puzzles[currentPuzzleSection];
    const middle = width - currPuzz.width * 32 * scale;
    const bottom = height - currPuzz.height * 32 * scale;

    this.nonogram = this.add.nonogram(middle, bottom, currPuzz);

    // Add Player
    this.player = this.add.player(this.nonogram.x, this.nonogram.y);

    // HealthBar
    this.healthbar = this.add.healthbar(
      width - 32 * scale * this.player.health - 10 * this.player.health,
      32 * scale,
      this.player.health
    );

    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 3000),
      loop: true,
      callback: this.hurtPlayer,
      callbackScope: this,
    });
  }

  hurtPlayer() {
    this.player?.removeHealth(1);
    // this.healthbar.setHealth(this.player.removeHealth(1));
  }

  selectCell(cell: ICell, { dragging }: BattleState) {
    if (this.keys?.select?.isDown) {
      this.setCellHoverStyles(cell);

      if (!dragging.contains(cell)) {
        dragging.add(cell);
      }
    }
  }

  fillCell(c: CellSprite, index: number, scale: number) {
    c.setState(CellState.selected);
    this.animateSelectCell(c, index, scale);
  }

  animateSelectCell(c: CellSprite, index: number, scale: number) {
    c.setAlpha(0.5);

    this.tweens.add({
      targets: c,
      alpha: 1,
      ease: "Stepped",
      delay: 500 / (index + 1),
      scale: scale,
      onStart: () => {
        if (c.state === CellState.selected) {
          this.emitter?.explode(6, c.x, c.y);
          this.cameras.main.shake(600 / (index + 1), 0.02 / (index + 1));
        }
      },
    });

    c.play(
      c.state === CellState.selected
        ? this.getSelectedAnimation()
        : this.getEmptyAnimation()
    );
  }

  // isPuzzzleSolved(puzz: NonogramData) {
  //   let result = "";
  //   for (var x = 0; x < puzz.height; x++) {
  //     for (var y = 0; y < puzz.width; y++) {
  //       if (this.nonogram?.getCell({ x, y }).state === CellState.selected) {
  //         result += `${x}${y}`;
  //       }
  //     }
  //   }

  //   return sha256(result).toString() === puzz.resultSha;
  // }

  setCellStyle(cell: ICell, scale = 2) {
    cell.state === CellState.selected
      ? this.setCellSelectedStyles(cell, scale)
      : this.setCellEmptyStyles(cell, scale);
  }

  setCellSelectedStyles(cell: ICell, scale = 2) {
    cell.play(this.getSelectedAnimation());
    cell.setAlpha(1);
    cell.setCrop(0, 0, 32, 32);
    cell.setScale(scale);
  }

  setCellEmptyStyles(cell: ICell, scale = 2) {
    cell.setState(CellState.empty);
    cell.setCrop(0, 0, 32, 32);
    cell.setAlpha(1);
    cell.setScale(scale);
    cell.play(this.getEmptyAnimation());
  }

  setCellHoverStyles(cell: ICell, scale = 2) {
    cell.play(this.getSelectedAnimation()).setAlpha(0.8);
    cell.setCrop(1, 1, 30, 30);
    cell.setScale(scale * 0.8);
  }

  setCellDisabledStyles(cell: ICell, scale = 2) {
    cell.play(this.getEmptyAnimation()).setAlpha(0.3);
    cell.setCrop(1, 1, 30, 30);
    cell.setScale(scale * 0.8);
  }

  getEmptyAnimation() {
    return this.getRandomAnimation("empty", 5);
  }

  getSelectedAnimation() {
    return this.getRandomAnimation("selected", 5);
  }

  getRandomAnimation(string: string, length = 5) {
    return string + "_" + Math.floor(Math.random() * length);
  }

  handlePuzzleUpdate() {
    if (this.nonogram?.isPuzzleSolved()) {
      const {
        currentPuzzleSection,
        currentNonogram,
        completedPuzzles,
        currentPuzzleIndex,
        minigrids,
      } = this.battleState.values;

      // this.keys?.select.removeAllListeners();
      this.nonogram?.rowClues?.map((r) => r.map((c) => c.setVisible(false)));
      this.nonogram?.colClues?.map((r) => r.map((c) => c.setVisible(false)));
      const solvedContainer = this.nonogram;
      let currentMinigrid;
      if (minigrids) {
        currentMinigrid = minigrids[currentPuzzleIndex];
      }
      const currentPuzz = this.puzzleSet[currentPuzzleIndex];
      const currentPuzzSection = currentPuzzleSection;
      this.player.resetHealth();
      console.log("currentPuzzSection first", currentPuzzSection);

      // All nonograms complete, reset to a new set puzzle in the set.
      if (currentPuzzSection === currentPuzz.puzzles.length - 1) {
        this.battleState.set({
          currentPuzzleSection: 0,
          completedPuzzles: [...completedPuzzles, currentPuzzleIndex],
        });

        if (completedPuzzles.length === this.puzzleSet.length) {
          console.log("BATTLE OVER!");
        }

        const unfinishedPuzzlesIndexes = this.puzzleSet
          .map((p, i) => i)
          .filter((p, i) => !completedPuzzles.includes(i));

        const randomPuzzleIndex =
          unfinishedPuzzlesIndexes[
            Math.floor(Math.random() * unfinishedPuzzlesIndexes.length)
          ];

        console.log("next nono", this.puzzleSet[randomPuzzleIndex].puzzles[0]);

        this.battleState.set({
          puzzle: this.puzzleSet[randomPuzzleIndex],
          currentPuzzleIndex: randomPuzzleIndex,
          currentNonogram: this.puzzleSet[randomPuzzleIndex].puzzles[0],
        });

        const middle =
          width - this.battleState.values.currentNonogram.width * 32 * scale;
        const bottom =
          height - this.battleState.values.currentNonogram.height * 32 * scale;

        this.time.delayedCall(1000, () => {
          this.nonogram = this.add.nonogram(
            middle,
            bottom,
            this.battleState.get("currentNonogram")
          );
        });
      } else {
        // Iterate to the next nonogram in the current puzzle.
        this.battleState.set({
          currentPuzzleSection:
            this.battleState.values.currentPuzzleSection + 1,
          currentNonogram:
            this.battleState.values.puzzle.puzzles[currentPuzzleSection + 1],
        });

        console.log("currentPuzzleSection", currentPuzzSection);

        this.time.delayedCall(
          1000,
          () => {
            if (this.nonogram?.nonogramData.width) {
              const middle =
                width - this.nonogram?.nonogramData.width * 32 * scale;
              const bottom =
                height - this.nonogram?.nonogramData.height * 32 * scale;
              this.nonogram = this.add.nonogram(
                middle,
                bottom,
                this.battleState.get("currentNonogram")
              );
            }
          },
          [],
          this
        );
      }

      this.time.delayedCall(
        1000,
        (
          nonogram: Nonogram,
          minigrid: MiniGrid,
          currentPuzz: Puzzle,
          currentPuzzleSection: number
        ) => {
          const path = { t: 0, vec: new Phaser.Math.Vector2() };
          const startPoint = new Phaser.Math.Vector2(nonogram.x, nonogram.y);
          var controlPoint1 = new Phaser.Math.Vector2(
            nonogram.x + 300,
            nonogram.y - 300
          );
          var controlPoint2 = new Phaser.Math.Vector2(
            nonogram.x + 100,
            nonogram.y - 300
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

          nonogram
            .getAll()
            .forEach((c) => c.state !== CellState.selected && c.destroy());

          this.tweens.add({
            targets: path,
            t: 1,
            ease: "Sine.easeInOut",
            duration: 1000,
            onUpdate: () => {
              curve.getPoint(path.t, path.vec);
              nonogram.x = path.vec.x;
              nonogram.y = path.vec.y;
            },
          });

          this.tweens.add({
            targets: nonogram,
            duration: 500,
            scale: scale / 10 / Math.sqrt(currentPuzz.puzzles.length),
            onComplete: () => {
              this.time.delayedCall(
                1500,
                (
                  currentPuzzleSection: number,
                  puzzleLength: number,
                  puzzleName: string
                ) => {
                  const offset = 5;
                  console.log(
                    "currentPuzzleSection in tween",
                    currentPuzzleSection
                  );
                  if (currentPuzzleSection > 0) {
                    // The current nonogram is part of a set of a larger image so set it within the minigrid.
                    nonogram.x =
                      minigrid.x +
                      minigrid.getAt(currentPuzzleSection).x +
                      offset;
                    nonogram.y =
                      minigrid.y +
                      minigrid.getAt(currentPuzzleSection).y +
                      offset;
                  } else {
                    nonogram.x = minigrid.x + minigrid.getAt(0).x + offset;
                    nonogram.y = minigrid.y + minigrid.getAt(0).y + offset;
                  }

                  // If the current puzzle section is the last piece of the larger image
                  if (currentPuzzleSection === puzzleLength - 1) {
                    minigrid.setVisible(false);
                    this.add.textsprite(
                      puzzleName,
                      minigrid.x + minigrid.x / 4,
                      minigrid.y - 32 + 32 / 2,
                      scale / 4
                    );
                  }

                  this.emitter?.explode(32, nonogram.x, nonogram.y);
                  this.cameras.main.shake(200);
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

  update() {
    // Update healthbar status
    this.healthbar.setHealth(this.player.health);
    for (const k in this?.keys) {
      const key = this?.keys[k];

      if (key) {
        if (key.isUp) {
          if (key.firedOnce) key.firedOnce = false;
        }

        if (key.isDown && !key.firedOnce) {
          this.player.move(key);
          key.firedOnce = true;
        }

        // Sliding controls
        if (!key.previousDuration) {
          key.previousDuration = key.getDuration();
        }

        const dur = key.getDuration() - key.previousDuration;
        if (key.isDown && key.getDuration() > 250 && dur > 200) {
          key.previousDuration = key.getDuration();
          this.player.move(key);
        }
      }
    }
  }
}

export default Battle;
