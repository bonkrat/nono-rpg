import { Direction } from "../../types/puzzle";
import Battle from "../scenes/battle";
import { scale } from "../scenes/battle/constants";

function moveDown(this: Battle) {
  if (
    this.player.currentCell.x <
    this.puzzle.puzzles[this.currentPuzzleSection].height - 1
  ) {
    animatePlayer.call(this, "down", () => this.selectCell());
    this.player.currentCell.x += 1;
  }
}

function moveUp(this: Battle) {
  if (this.player.currentCell.x > 0) {
    animatePlayer.call(this, "up", () => this.selectCell());
    this.player.currentCell.x -= 1;
  }
}

function moveLeft(this: Battle) {
  if (this.player.currentCell.y > 0) {
    animatePlayer.call(this, "left", () => this.selectCell());
    this.player.currentCell.y -= 1;
  }
}

function moveRight(this: Battle) {
  if (
    this.player.currentCell.y <
    this.puzzle.puzzles[this.currentPuzzleSection].width - 1
  ) {
    animatePlayer.call(this, "right", () => this.selectCell());
    this.player.currentCell.y += 1;
  }
}

function animatePlayer(
  this: Battle,
  direction: Direction,
  onStart: () => void
) {
  this.tweens.add({
    targets: this.player,
    duration: 150,
    ...(["left", "right"].includes(direction) && {
      x: (direction === "left" ? "-" : "+") + "=" + 32 * scale,
    }),
    ...(["up", "down"].includes(direction) && {
      y: (direction === "up" ? "-" : "+") + "=" + 32 * scale,
    }),
    ease: "Bounce",
    onStart,
  });
}

export function movePlayer(this: Battle, key: Phaser.Input.Keyboard.Key) {
  if (key === this.keys?.down) {
    moveDown.call(this);
  } else if (key === this.keys?.up) {
    moveUp.call(this);
  } else if (key === this.keys?.left) {
    moveLeft.call(this);
  } else if (key === this.keys?.right) {
    moveRight.call(this);
  }
}
