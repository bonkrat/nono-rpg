import sha256 from "crypto-js/sha256";
import { chunk, isEqual, times } from "lodash";
import Phaser from "phaser";
import { Cell } from "..";
import { CellState } from "../../common";
import { Battle } from "../../scenes/battle";
import { height, width } from "../../scenes/battle/constants";
import { pickRandom } from "../../utils";

export class Nonogram {
  nonogramData: NonogramData;
  rowClues: Phaser.GameObjects.Sprite[][];
  colClues: Phaser.GameObjects.Sprite[][];
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  scale: number;

  constructor(scene: Battle, data: NonogramData, scale: number) {
    this.scene = scene;
    this.nonogramData = data;
    this.container = scene.add.container();
    this.scale = scale;

    let cells: Cell[][] = [];
    times(this.nonogramData.height, (i) => {
      times(this.nonogramData.width, (j) => {
        const cell = scene.add
          .cell(32 * i * this.scale, 32 * j * this.scale)
          .setScale(this.scale);
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
      scale: { start: this.scale, end: 0.5 },
      rotate: { start: 0, end: 360, ease: "Power2" },
      on: false,
    });

    this.addParticles(particles);

    return this;
  }

  draw(coords?: Coordinates) {
    const middle = width - this.nonogramData.width * 32 * this.scale;
    const bottom = height - this.nonogramData.height * 32 * this.scale;

    const x = coords?.x || middle,
      y = coords?.y || bottom;

    this.container.setPosition(x, y);

    this.getAll().forEach((cell: Cell) => {
      cell.setCellEmptyStyles();
    });

    this.nonogramData.hint?.cells?.forEach((c, i) => {
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

  getNeighborCells(radius: number, centerCell: Cell) {
    const cells = this.getAll();

    return cells.filter((c: Cell) => {
      const cellDistances = this.getCellDistance(centerCell, c);

      return cellDistances
        .map((distance) => distance <= radius)
        .every((v) => v === true);
    });
  }

  getRandomCell(): Cell {
    return pickRandom(this.getAll());
  }

  getAll(): Cell[] {
    return this.container.getAll("type", "Cell") as Cell[];
  }

  getColumns(): Cell[][] {
    return chunk(this.getAll(), this.nonogramData.width) as Cell[][];
  }

  getRandomRow() {
    return pickRandom(this.getRows());
  }

  getRandomColumn() {
    return pickRandom(this.getColumns());
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
      return [...clues].reverse().map((clue, j) => {
        const firstRowCell = this.getRows()[i][0];
        const clueSprite = this.scene.add.sprite(
          firstRowCell.getCenter().x - 32 * this.scale * (j + 1),
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
      return [...clues].reverse().map((clue, j) => {
        const firstColCell = this.getColumns()[i][0];
        const clueSprite = this.scene.add.sprite(
          firstColCell.getCenter().x,
          firstColCell.getCenter().y - 32 * this.scale * (j + 1),
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

  private getCellDistance(from: Cell, to: Cell) {
    const fromPos = this.getCellCoordinates(from);
    const toPos = this.getCellCoordinates(to);

    return [fromPos.x - toPos.x, fromPos.y - toPos.y].map((v) => Math.abs(v));
  }

  private getCellCoordinates(cell: Cell): Coordinates {
    const cells = this.getAll();
    const cellIndex = cells.indexOf(cell);

    const x = Math.floor(cellIndex / this.nonogramData.height);
    const y = cellIndex - x * this.nonogramData.width;

    return { x, y };
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
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    data: NonogramData,
    scale: number
  ) {
    const nonogram = new Nonogram(this.scene as Battle, data, scale);

    this.displayList.add(nonogram.container);
    return nonogram;
  }
);
