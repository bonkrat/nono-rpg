import {
  BattleState,
  BattleStateManager,
  Cell,
  Direction,
  Nonogram,
  Player,
} from "../../types/puzzle";
import Battle from "../scenes/battle";
import { scale } from "../scenes/battle/constants";

function moveDown(
  scene: Battle,
  player: Player,
  setPlayer: Function,
  currentNonogram: Nonogram
) {
  if (player.currentCell.x < currentNonogram.height - 1) {
    animatePlayer(scene, "down", () => scene.selectCell());
    setPlayer({ x: player.currentCell.x + 1, y: player.currentCell.y });
  }
}

function moveUp(scene: Battle, player: Player, setPlayer: Function) {
  if (player.currentCell.x > 0) {
    animatePlayer(scene, "up", () => scene.selectCell());
    setPlayer({ x: player.currentCell.x - 1, y: player.currentCell.y });
  }
}

function moveLeft(scene: Battle, player: Player, setPlayer: Function) {
  if (player.currentCell.y > 0) {
    animatePlayer(scene, "left", () => scene.selectCell());
    setPlayer({ y: player.currentCell.y - 1, x: player.currentCell.x });
  }
}

function moveRight(
  scene: Battle,
  player: Player,
  setPlayer: Function,
  currentNonogram: Nonogram
) {
  if (player.currentCell.y < currentNonogram.width - 1) {
    animatePlayer(scene, "right", () => scene.selectCell());
    setPlayer({ y: player.currentCell.y + 1, x: player.currentCell.x });
  }
}

function animatePlayer(
  scene: Battle,
  direction: Direction,
  onStart: () => void
) {
  scene.tweens.add({
    targets: scene.playerSprite,
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

export function movePlayer(
  scene: Battle,
  battleState: BattleStateManager,
  key: Phaser.Input.Keyboard.Key
) {
  const { currentNonogram, player } = battleState.values;

  const setPlayerCell = function (currentCell: { x: number; y: number }) {
    battleState.set("player", { currentCell });
  };

  if (key === scene.keys?.down) {
    moveDown(scene, player, setPlayerCell, currentNonogram);
  } else if (key === scene.keys?.up) {
    moveUp(scene, player, setPlayerCell);
  } else if (key === scene.keys?.left) {
    moveLeft(scene, player, setPlayerCell);
  } else if (key === scene.keys?.right) {
    moveRight(scene, player, setPlayerCell, currentNonogram);
  }
}
