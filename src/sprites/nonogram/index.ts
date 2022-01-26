import sha256 from "crypto-js/sha256";
import { chunk, isEqual, times } from "lodash";
import Phaser from "phaser";
import { Coordinates, NonogramData, Puzzle } from "../../../types/puzzle";
import { CellState } from "../../common";
import generateClues from "../../helpers/generateClues";
import Battle from "../../scenes/battle";
import { scale } from "../../scenes/battle/constants";
import "../cell";

export default class Nonogram extends Phaser.GameObjects.Container {
  nonogramData: NonogramData;
  rowClues: Phaser.GameObjects.Sprite[][];
  colClues: Phaser.GameObjects.Sprite[][];

  constructor(scene: Battle, x: number, y: number, data: NonogramData) {
    super(scene, x, y);
    this.nonogramData = data;

    let cells: ICell[][] = [];
    for (var i = 0; i < this.nonogramData.height; i++) {
      for (var j = 0; j < this.nonogramData.width; j++) {
        const cell = scene.add.cell(32 * i * scale, 32 * j * scale);
        if (!cells[j]) {
          cells[j] = [];
        }

        cells[j][i] = cell as ICell;

        this.add(cell);

        cell.setScale(scale);
        cell.play(scene.getEmptyAnimation());
      }
    }

    const { rowClues, colClues } = this.buildClues();
    this.rowClues = rowClues;
    this.colClues = colClues;

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
        scene.fillCell(cell as ICell, i, scale);
      }
    });

    const particles = scene.add.particles("cellSelected");

    scene.emitter = particles.createEmitter({
      frame: 0,
      lifespan: 1000,
      speed: 600,
      //   alpha: { start: 1, end: 0 },
      gravityY: 2000,
      scale: { start: scale, end: 0.5 },
      rotate: { start: 0, end: 360, ease: "Power2" },
      //   blendMode: "ADD",
      on: false,
    });

    this.addParticles(particles);

    this.setCompletedRowsAndColumns();
  }

  addParticles(particles: Phaser.GameObjects.Particles.ParticleEmitterManager) {
    return super.add(particles);
  }

  add(cell: ICell | ICell[]) {
    return super.add(cell);
  }

  getCell({ x, y }: Coordinates) {
    const { puzzle, currentPuzzleSection } = (this.scene as Battle).battleState
      .values;
    return this.getAt(y * puzzle.puzzles[currentPuzzleSection].width + x);
  }

  getAll() {
    return super.getAll("type", "Cell");
  }

  getColumns(): ICell[][] {
    return chunk(this.getAll(), this.nonogramData.width) as ICell[][];
  }

  getRows(): ICell[][] {
    const cols = this.getColumns();

    return times(this.nonogramData.height, (i) =>
      cols.map((col) => col[i])
    ) as ICell[][];
  }

  setCompletedRowsAndColumns() {
    const scene = this.scene as Battle;
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
        rowClues.push(generateClues(selected));
      });

      this.nonogramData.rowClues.forEach((r, i) => {
        if (isEqual(r, rowClues[i])) {
          rows[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setState(CellState.disabled);
              scene.setCellDisabledStyles(c, scale);
            }
          });
        } else {
          rows[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setState(CellState.disabled);
              scene.setCellEmptyStyles(c, scale);
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
        colClues.push(generateClues(selected));
      });

      this.nonogramData.colClues.forEach((r, i) => {
        if (isEqual(r, colClues[i].reverse())) {
          cols[i].forEach((c) => {
            if (c.state !== CellState.selected) {
              c.setState(CellState.disabled);
              scene.setCellDisabledStyles(c, scale);
            }
          });
        } else {
          cols[i].forEach((c) => {
            if (![CellState.disabled, CellState.selected].includes(c.state)) {
              scene.setCellEmptyStyles(c, scale);
            }
          });
        }
      });
    }
  }

  buildClues() {
    const rowClues = this.nonogramData.rowClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = this.scene.add.sprite(
          -32 * j * scale - 64,
          32 * i * scale - 32 / 4,
          "clue"
        );

        this.add(clueSprite);
        clueSprite.play("number_" + clue);

        return clueSprite;
      });
    });

    const colClues = this.nonogramData.colClues.map((clues, i) => {
      return clues.reverse().map((clue, j) => {
        const clueSprite = this.scene.add.sprite(
          32 * i * scale,
          0 - 32 * scale - j * scale * 32 - 32 / 4,
          "clue"
        );

        clueSprite.play("number_" + clue);
        this.add(clueSprite);

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
}

Phaser.GameObjects.GameObjectFactory.register(
  "nonogram",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    data: NonogramData
  ) {
    const nonogram = new Nonogram(this.scene as Battle, x, y, data);

    this.displayList.add(nonogram);

    return nonogram;
  }
);
