import { Battle } from "../scenes/battle";
import { scale } from "../scenes/battle/constants";
import { Cell } from "../sprites";

/**
 * Provides methods for animating attacks and dealing damage.
 */
export class AttackManager {
  scene: Battle;
  attackTint = 0x7a59ba;
  tweens = [] as Phaser.Tweens.Tween[];

  constructor(scene: Battle) {
    this.scene = scene;
  }

  setAttackTint(attackTint: number) {
    this.attackTint = attackTint;
  }

  columnAttack(column?: Cell[]) {
    const col = column || (this.scene as Battle).nonogram?.getRandomColumn();
    col.forEach((c, i) => this.cellAttack(c, i));
  }

  rowAttack(row?: Cell[]) {
    const r = row || (this.scene as Battle).nonogram?.getRandomRow();
    r.forEach((c, i) => this.cellAttack(c, i));
  }

  rowAndColumnAttack() {
    const scene = this.scene as Battle;
    const randomRowOrColumn = [
      ...scene.nonogram?.getRandomRow(),
      ...scene.nonogram?.getRandomColumn(),
    ];
    randomRowOrColumn.forEach((c, i) =>
      this.tweens.push(this.cellAttack(c, i))
    );
  }

  randomColumnAttack() {
    const scene = this.scene;
    scene.nonogram
      ?.getRandomColumn()
      .forEach((c, i) => this.tweens.push(this.cellAttack(c, i)));
  }

  randomRowAttack() {
    const scene = this.scene;
    scene.nonogram
      ?.getRandomRow()
      .forEach((c, i) => this.tweens.push(this.cellAttack(c, i)));
  }

  /**
   * Attacks a square area of cells all at once.
   * @param radius the radius of the square.
   * @param cell the center cell of the attack square.
   */
  cellAreaAttack(radius: number, cell?: Cell) {
    const scene = this.scene as Battle;
    const centerCell = cell || scene.nonogram.getRandomCell();

    scene.nonogram
      .getNeighborCells(radius, centerCell)
      .forEach((c) => this.cellAttack(c));
  }

  randomCellAttack() {
    console.log("RANDOM CELL ATTACK");
    const randomCell = (this.scene as Battle).nonogram.getRandomCell();
    this.cellAttack(randomCell);
  }

  cellAttack(cell: Cell, index = 0) {
    const scene = this.scene as Battle;
    const originalTints = cell.tint;
    const originalAlphas = cell.alpha;
    const tween = scene.tweens.addCounter({
      from: 0.3,
      to: 1,
      duration: 500,
      loop: 1000 / 500,
      ease: "Cubic",
      onStart: () => {
        cell.setTint(this.attackTint);
      },
      onUpdate: function (tween) {
        const value = tween.getValue();
        cell.setAlpha(value);
      },
      onComplete: () => {
        const flame = this.addFlame(
          cell.getBounds().centerX,
          cell.getBounds().centerY - 20
        );

        flame
          .setName("flamecell")
          .setVisible(false)
          .setScale(scale * 1.5)
          .setTint(this.attackTint)
          .play("flamecell");

        let hitPlayer = false;

        this.tweens.push(
          scene.tweens.add({
            targets: flame,
            delay: index * 100,
            duration: 300,
            loop: false,
            scale: scale,
            ease: "Power2",
            onStart: () => {
              flame.setVisible(true);
            },
            onUpdate: () => {
              if (
                scene.nonogram.getCell(scene.player.currentCell) === cell &&
                hitPlayer === false
              ) {
                scene.player.removeHealth(1);
                hitPlayer = true;
              }
            },
            onComplete: (_tween, targets) => {
              cell.setTint(originalTints);
              cell.setAlpha(originalAlphas);
              this.releaseFlame(targets[0]);
            },
          })
        );
      },
    });

    this.tweens.push(tween);
    return tween;
  }

  stopAttack() {
    this.tweens.map((tween) => {
      tween.stop();
      tween.remove();
    });
    this.tweens = [];
    this.releaseAll();
  }

  private releaseAll() {
    this.scene.spritepool.releaseAll("name", "flamecell");
  }

  private releaseFlame(s: Phaser.GameObjects.Sprite) {
    this.scene.spritepool.release(s);
  }

  private addFlame(x: number, y: number) {
    return this.scene.spritepool.get(x, y);
  }
}
