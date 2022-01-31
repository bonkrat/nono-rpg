import { shuffle } from "lodash";
import Phaser from "phaser";
import {
  cell,
  cellSelected,
  numbers,
  player,
  letters,
  fullHealthBar,
  fullHealthCap,
  emptyHealthBar,
  emptyHealthCap,
} from "../../assets/sprites";
import { CellState } from "../../common";
import { HealthBar, Player, Nonogram, MiniGrid } from "../../sprites";
import enemies from "../../sprites/enemies";
import { Enemy } from "../../sprites/enemies/enemy";
import { width, scale, height } from "./constants";
import("../../sprites");

/**
 * @class Battle
 * @property {PuzzleSet} puzzleSet the current set of puzzles that need to be completed to win the battle.
 * @property {Puzzle} puzzle the current puzzle being played.
 * @property {number} currentPuzzleSection the index of the current part of the puzzle that is in progress. used for puzzles with multiple nonograms.
 * @property {number} currentPuzzleIndex the index of the current puzzle being solved out of the puzzle set.
 * @property {Nonogram} currentNonogram the current nonogram being played.
 * @property {number[]} completedPuzzles an array of puzzle section indices that have been completed.
 * @property {NonoGram} nonogram a container for the current nonogram being played
 * @property {MiniGrid[]} minigrids an array of minigrids shown on the battle screen for completed puzzles to appear in.
 */
class Battle extends Phaser.Scene {
  public enemyClass: EnemyClass;
  public puzzleSet!: PuzzleSet;
  public puzzle!: Puzzle;
  public currentPuzzleSection!: number;
  public currentPuzzleIndex!: number;
  public completedPuzzles!: number[];
  public keys?: BattleKeys;
  public emitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  public healthbar!: HealthBar;
  public timerEvents?: Phaser.Time.TimerEvent[];
  public player!: Player;
  public nonogram!: Nonogram;
  public minigrids!: MiniGrid[];
  public enemy?: Enemy;

  constructor(config: Phaser.Types.Scenes.SettingsConfig, enemy: EnemyClass) {
    super(config);
    this.enemyClass = enemy;
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

  async create() {
    console.log(this.scene.manager.scenes);
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

    this.enemy = (await this.add.enemy(this.enemyClass)).draw(175, 300);

    this.puzzleSet = this.enemy.puzzleSet;
    this.puzzle = this.puzzleSet[0];
    this.currentPuzzleSection = 0;
    this.currentPuzzleIndex = 0;
    this.completedPuzzles = [];
    this.minigrids = [];

    // Add minigrids
    this.minigrids = this.buildMiniGrids();

    // Initialize and render nonogram
    this.nonogram = this.add.nonogram(this.puzzleSet[0].puzzles[0]).draw();

    // Add Player
    this.player = this.add.player(this.nonogram.x, this.nonogram.y);

    // HealthBar
    this.healthbar = this.add.healthbar(
      width - 32 * scale * this.player.health - 10 * this.player.health,
      32 * scale,
      this.player.health
    );
  }

  handlePuzzleUpdate() {
    if (this.nonogram?.isPuzzleSolved()) {
      // this.keys?.select.removeAllListeners();
      this.nonogram?.rowClues?.map((r) => r.map((c) => c.setVisible(false)));
      this.nonogram?.colClues?.map((r) => r.map((c) => c.setVisible(false)));
      const solvedContainer = this.nonogram.container;

      let currentMinigrid;
      if (this.minigrids) {
        currentMinigrid = this.minigrids[this.currentPuzzleIndex];
      }
      const currentPuzz = this.puzzle;
      const currentPuzzSection = this.currentPuzzleSection;

      this.player.resetHealth();

      // All nonograms complete, reset to a new set puzzle in the set.
      if (currentPuzzSection === currentPuzz.puzzles.length - 1) {
        this.currentPuzzleSection = 0;
        this.completedPuzzles.push(this.currentPuzzleIndex);

        if (this.completedPuzzles.length === this.puzzleSet.length) {
          this.time.delayedCall(4000, () => {
            this.scene.transition({
              target: shuffle(
                shuffle(enemies).filter((e) => e.name !== this.enemyClass.name)
              )[0].name,
              duration: 0,
            });
          });
        } else {
          const unfinishedPuzzlesIndexes = this.puzzleSet
            .map((_p, i) => i)
            .filter((_p, i) => !this.completedPuzzles.includes(i));

          const randomPuzzleIndex =
            unfinishedPuzzlesIndexes[
              Math.floor(Math.random() * unfinishedPuzzlesIndexes.length)
            ];

          this.puzzle = this.puzzleSet[randomPuzzleIndex];
          this.currentPuzzleIndex = randomPuzzleIndex;

          this.time.delayedCall(1000, () => {
            this.nonogram = this.add.nonogram(this.puzzle.puzzles[0]).draw();
          });
        }
      } else {
        // Iterate to the next nonogram in the current puzzle.
        this.currentPuzzleSection += 1;

        this.time.delayedCall(
          1000,
          () => {
            this.nonogram = this.add
              .nonogram(this.puzzle.puzzles[this.currentPuzzleSection])
              .draw();
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

  private buildMiniGrids(): MiniGrid[] {
    const bottomAlign = (x: number) => x + height - 32 * scale - 32 * scale;
    const leftAlign = (x: number) => x + 32;

    return this.puzzleSet.map((puzz, index) => {
      const margin = 10 * index;
      const minigrid = this.add.minigrid(
        leftAlign(
          this.puzzleSet.length * scale +
            32 * scale * index +
            margin * this.puzzleSet.length
        ),
        bottomAlign(32),
        puzz
      );

      return minigrid;
    });
  }

  update() {
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
