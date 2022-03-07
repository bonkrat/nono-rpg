import { shuffle } from "lodash";
import { mobs } from "../../assets/sprites";
import { AttackManager } from "../../classes/AttackManager";
import { puzzles } from "../../puzzles";
import { pickRandom } from "../../utils";
import { Enemy } from "./enemy";
import { getRandomMobSprite } from "./helpers";

export const enum DIFFICULTY {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
  NIGHTMARE = "nightmare",
}

/**
 * Builder for smaller generic enemies.
 *
 * @param mobConfig config for the mob class
 * @returns a class to build a mob from.
 */
export function buildMob({
  puzzleSet,
  assets,
  displayName,
  description,
  introduction,
  dialogue,
  difficulty,
  key,
}: MobConfig) {
  return class Mob extends Enemy {
    static puzzleSet = puzzleSet;
    static assets = assets;
    static type = "mob";
    static key = key;
    displayName = displayName;
    description = description;
    introduction = introduction;
    dialogue = dialogue;

    constructor(scene: Phaser.Scene) {
      super(scene);
    }

    startAttack(): Enemy {
      let delay: number;

      switch (difficulty) {
        case DIFFICULTY.EASY:
          delay = 4000;
          break;
        case DIFFICULTY.NORMAL:
        default:
          delay = 3000;
          break;
        case DIFFICULTY.HARD:
          delay = 2000;
          break;
        case DIFFICULTY.NIGHTMARE:
          delay = 1500;
          break;
      }

      this.attackEvent = this.scene.time.addEvent({
        startAt: 2000,
        delay,
        loop: true,
        callback: this.attack,
        callbackScope: this,
      });
      return this;
    }

    attack() {
      const attack = pickRandom([
        "randomCellAttack",
        "randomColumnAttack",
        "randomRowAttack",
        "rowAndColumnAttack",
      ]) as keyof AttackManager;

      (this.attackManager[attack] as () => void).call(this.attackManager);

      return this;
    }

    draw(...args: Parameters<Enemy["draw"]>) {
      super.draw(...args);
      this.sprite.setScale(3);
      return this;
    }
  };
}

export function buildRandomMob(
  config: Partial<Omit<MobConfig, "assets">> & Pick<MobConfig, "difficulty">
) {
  const url = getRandomMobSprite();
  const key = "mob_" + mobs.indexOf(url);

  return buildMob({
    puzzleSet: shuffle(puzzles).slice(0, 1) as PuzzleSet,
    assets: [
      {
        key,
        url,
        frameConfig: { frameWidth: 128, frameHeight: 128 },
      },
    ],
    displayName: key,
    description: "",
    introduction: [],
    dialogue: [],
    key,
    ...config,
  });
}
