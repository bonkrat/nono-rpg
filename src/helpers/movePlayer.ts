import { Player, Nonogram, BattleStateManager } from "../../types/puzzle";
import Battle from "../scenes/battle";

function moveDown({ x, y }: Player, currentNonogram: Nonogram) {
  if (x < currentNonogram.height - 1) {
    return { x: x + 1, y };
  }
}

function moveUp({ x, y }: Player) {
  if (x > 0) {
    return { x: x - 1, y };
  }
}

function moveLeft({ x, y }: Player) {
  if (y > 0) {
    return { y: y - 1, x };
  }
}

function moveRight({ x, y }: Player, currentNonogram: Nonogram) {
  if (y < currentNonogram.width - 1) {
    return { y: y + 1, x };
  }
}

export function movePlayer(
  scene: Battle,
  battleState: BattleStateManager,
  key: Phaser.Input.Keyboard.Key
) {
  const { currentNonogram, player } = battleState.values;

  let newPosition;

  if (key === scene.keys?.down) {
    newPosition = moveDown(player, currentNonogram);
  } else if (key === scene.keys?.up) {
    newPosition = moveUp(player);
  } else if (key === scene.keys?.left) {
    newPosition = moveLeft(player);
  } else if (key === scene.keys?.right) {
    newPosition = moveRight(player, currentNonogram);
  }

  newPosition &&
    battleState.set("player", {
      x: newPosition?.x,
      y: newPosition?.y,
      health: player.health,
      hearts: player.hearts,
    } as Player);
}
