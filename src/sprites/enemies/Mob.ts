import { shuffle } from "lodash";
import { puzzles } from "../../puzzles";
import { Enemy } from "./enemy";
import { getRandomMobSprite } from "./helpers";

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
  attack,
}: MobConfig) {
  return class Mob extends Enemy {
    static puzzleSet = puzzleSet;
    static assets = assets;
    static type = "mob";
    displayName = displayName;
    description = description;
    introduction = introduction;
    dialogue = dialogue;

    constructor(scene: Phaser.Scene) {
      super(scene);
    }

    public attack(): Enemy {
      attack();
      return this;
    }

    draw(...args: Parameters<Enemy["draw"]>) {
      super.draw(...args);
      this.sprite.setScale(3);
      return this;
    }
  };
}

export function buildRandomMob(config?: Partial<Omit<MobConfig, "assets">>) {
  return buildMob({
    puzzleSet: shuffle(puzzles).slice(0, 1) as PuzzleSet,
    assets: [
      {
        url: getRandomMobSprite(),
        frameConfig: { frameWidth: 128, frameHeight: 128 },
      },
    ],
    displayName: "Mob",
    description: "",
    introduction: [],
    dialogue: [],
    attack: () => {},
    ...config,
  });
}
