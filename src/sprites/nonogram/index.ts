import sha256 from "crypto-js/sha256";
import { chunk, isEqual, times } from "lodash";
import Phaser from "phaser";
import { Cell } from "..";
import { CellState } from "../../common";
import { Battle } from "../../scenes/battle";
import { height, scale, width } from "../../scenes/battle/constants";

export class Nonogram {
  nonogramData: NonogramData;
  rowClues: Phaser.GameObjects.Sprite[][];
  colClues: Phaser.GameObjects.Sprite[][];
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;

  constructor(scene: Battle, data: NonogramData) {
    this.scene = scene;
    this.nonogramData = data;
    this.container = scene.add.container();

    let cells: Cell[][] = [];
    times(this.nonogramData.height, (i) => {
      times(this.nonogramData.width, (j) => {
        const cell = scene.add.cell(32 * i * scale, 32 * j * scale);
        if (!cells[j]) {
          cells[j] = [];
        }

        cells[j][i] = cell as Cell;

        this.add(cell);
      });
    });

    const { rowClues, colClues } = this.buildClues();
    this.rowClues = rowClues;
    this.colClues = colClues;

    const particles = scene.add.particles("cellSelected");

    scene.emitter = particles.createEmitter({
      frame: 0,
      lifespan: 1000,
      speed: 600,
      gravityY: 2000,
      scale: { start: scale, end: 0.5 },
      rotate: { start: 0, end: 360, ease: "Power2" },
      on: false,
    });

    this.addParticles(particles);

    return this;
  }

  draw(coords?: Coordinates) {
    const middle = width - this.nonogramData.width * 32 * scale;
    const bottom = height - this.nonogramData.height * 32 * scale;

    const x = coords?.x || middle,
      y = coords?.y || bottom;

    this.container.setPosition(x, y);

    this.getAll().forEach((cell: Cell) => {
      cell.playEmptyAnimation();
    });

    this.nonogramData.hint?.cells.forEach((c, i) => {
      const cell =
        this.nonogramData.hint.direction === "col"
          ? this.getCell({
              x: i,
              y: this.nonogramData.hint.index,
            })
          : this.getCell({
              x: this.nonogramData.hint.index,
              y: i,
            });

      if (c.selected) {
        cell.fillCell();
      }
    });

    this.setCompletedRowsAndColumns();

    return this;
  }

  addParticles(particles: Phaser.GameObjects.Particles.ParticleEmitterManager) {
    return this.container.add(particles);
  }

  add(cell: Cell | Cell[]) {
    return this.container.add(cell);
  }

  getCell({ x, y }: Coordinates): Cell {
    const { puzzle, currentPuzzleSection } = this.scene as Battle;
    return this.container.getAt(
      y * puzzle.puzzles[currentPuzzleSection].width + x
    ) as Cell;
  }

  getAll(): Cell[] {
    return this.container.getAll("type", "Cell") as Cell[];
  }

  getColumns(): Cell[][] {
    return chunk(this.getAll(), this.nonogramData.width) as Cell[][];
  }

  getRows(): Cell[][] {
    const cols = this.getColumns();

    return times(this.nonogramData.height, (i) =>
      cols.map((col) => col[i])
    ) as Cell[][];
  }

  /**
   * Goes through each row and column and determines which are completed and greys out the cells that are not selected but in completed columns/rows.
   */
  setCompletedRowsAndColumns() {
    if (!this.isPuzzleSolved()) {
      // Rows first
      const rowClues: number[][] = [];

      const rows = this.getRows();
      const cols = this.getColumns();

      rows.map((row) => {
        const selected = row.reduce((acc: number[], curr, index) => {
          if (curr.state === CellState.selected) {
            acc.push(index);
          }
          return acc;
        }, []);
        rowClues.push(Nonogram.generateClues(selected));
      });

      this.nonogramData.rowClues.forEach((r, i) => {
        if (isEqual(r, rowClues[i])) {
          rows[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setCellDisabledStyles();
            }
          });
        } else {
          rows[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setCellEmptyStyles();
            }
          });
        }
      });

      // Then Columns
      const colClues: number[][] = [];

      cols.map((col) => {
        const selected = col.reduce((acc: number[], curr, index) => {
          if (curr.state === CellState.selected) {
            acc.push(index);
          }
          return acc;
        }, []);
        colClues.push(Nonogram.generateClues(selected));
      });

      this.nonogramData.colClues.forEach((r, i) => {
        if (isEqual(r, colClues[i].reverse())) {
          cols[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setCellDisabledStyles();
            }
          });
        } else {
          cols[i].forEach((c) => {
            if (
              ![CellState.disabled, CellState.selected].includes(
                c.state as CellState
              )
            ) {
              c.setCellEmptyStyles();
            }
          });
        }
      });
    }
  }

  buildClues() {
    const rowClues = this.nonogramData.rowClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const firstRowCell = this.getRows()[i][0];
        const clueSprite = this.scene.add.sprite(
          firstRowCell.getCenter().x - 32 * scale * (j + 1),
          firstRowCell.getCenter().y,
          "clue"
        );
        clueSprite.type = "Clue";

        this.container.add(clueSprite);
        clueSprite.play("number_" + clue);

        return clueSprite;
      });
    });

    const colClues = this.nonogramData.colClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const firstColCell = this.getColumns()[i][0];
        const clueSprite = this.scene.add.sprite(
          firstColCell.getCenter().x,
          firstColCell.getCenter().y - 32 * scale * (j + 1),
          "clue"
        );
        clueSprite.type = "Clue";

        clueSprite.play("number_" + clue);
        this.container.add(clueSprite);

        return clueSprite;
      });
    });
    return { rowClues, colClues };
  }

  isPuzzleSolved() {
    let result = "";
    for (var x = 0; x < this.nonogramData.height; x++) {
      for (var y = 0; y < this.nonogramData.width; y++) {
        if (this.getCell({ x, y }).state === CellState.selected) {
          result += `${x}${y}`;
        }
      }
    }

    return sha256(result).toString() === this.nonogramData.resultSha;
  }

  /**
   * Calculates the groups of selected cells for the nonogram.
   * e.g., [0,1,2,4,5,6,9,10] becomes [3, 2, 2, 1].
   */
  static generateClues(cells: number[]) {
    cells.sort((a, b) => a - b);
    const result = cells.reduce((acc: number[], curr, index) => {
      if (index && curr === cells[index - 1] + 1) {
        acc[acc.length - 1] += 1;
      } else {
        acc.push(1);
      }
      return acc;
    }, []);

    return !result.length ? [0] : result;
  }

  get x() {
    return this.container.x;
  }

  set x(newX: number) {
    this.container.setX(newX);
  }

  get y() {
    return this.container.y;
  }

  set y(newY: number) {
    this.container.setY(newY);
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "nonogram",
  function (this: Phaser.GameObjects.GameObjectFactory, data: NonogramData) {
    const nonogram = new Nonogram(this.scene as Battle, data);

    this.displayList.add(nonogram.container);
    return nonogram;
  }
);
