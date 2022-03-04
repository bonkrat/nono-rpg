import { times } from "lodash";
import { smallPuzzles } from "../puzzles";
import { getRandomBoss } from "../sprites/enemies/helpers";
import { buildRandomMob } from "../sprites/enemies/Mob";
import { pickRandom } from "../utils";

export const enum ACTIONS {
  ENEMY_DEFEATED = "enemy_defeated",
}

export class GameStatePlugin extends Phaser.Plugins.BasePlugin {
  data: GameStateMap;

  constructor(
    ...args: ConstructorParameters<typeof Phaser.Plugins.BasePlugin>
  ) {
    super(...args);
    this.data = new Map();
    this.resetData();
  }

  public get currentEnemy(): EnemyClass {
    const { rounds, roundNum, enemyNum } = this.get([
      "rounds",
      "roundNum",
      "enemyNum",
    ]);

    return rounds[roundNum].enemies[enemyNum];
  }

  public dispatch(action: ACTIONS) {
    switch (action) {
      case ACTIONS.ENEMY_DEFEATED:
        const currentEnemeyNum = this.get("enemyNum");
        this.set({ enemyNum: currentEnemeyNum + 1 });
        break;

      default:
        break;
    }
  }

  private get<K extends keyof GameState | (keyof GameState)[]>(
    keys: K
  ): GetGameStateReturnValue<K> {
    if (Array.isArray(keys)) {
      return keys.reduce((state: any, key) => {
        const val = this.data.get(key);
        state[key] = val as GameState[typeof key];
        return state;
      }, {});
    } else {
      return this.data.get(keys) as any;
    }
  }

  private set(state: Partial<GameState>) {
    for (const key in state) {
      this.data.set(
        key as keyof GameState,
        state[key as keyof GameState] as GameState[keyof GameState]
      );
    }

    return this.data;
  }

  private resetData() {
    this.set({
      rounds: [
        {
          enemies: [
            ...(times(1, () =>
              buildRandomMob({ puzzleSet: [pickRandom(smallPuzzles)] })
            ) as EnemyClass[]),
            getRandomBoss(),
          ],
        },
      ],
      roundNum: 0,
      enemyNum: 0,
    });
  }

  private set currentEnemy(_value: EnemyClass) {}
}
