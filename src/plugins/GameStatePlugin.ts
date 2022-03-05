import { times } from "lodash";
import { smallPuzzles } from "../puzzles";
import { getRandomBoss } from "../sprites/enemies/helpers";
import { buildRandomMob } from "../sprites/enemies/Mob";
import { pickRandom } from "../utils";

export const enum ACTIONS {
  ENEMY_DEFEATED = "enemy_defeated",
  PLAYER_DEFEATED = "player_defeated",
}

export const enum STATUS {
  IN_PROGRESS = "in_progress",
  WON = "won",
  LOST = "lost",
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

  public get status(): STATUS {
    return this.data.get("status");
  }

  public dispatch(action: ACTIONS) {
    switch (action) {
      case ACTIONS.ENEMY_DEFEATED:
        const { rounds, roundNum, enemyNum } = this.get([
          "rounds",
          "roundNum",
          "enemyNum",
        ]);
        const numOfEnemeiesInRound = rounds[roundNum].enemies.length;

        if (enemyNum === numOfEnemeiesInRound - 1) {
          if (roundNum === rounds.length - 1) {
            // Game over if last enemy is defeated
            this.set({
              status: STATUS.WON,
            });
          } else {
            // Go to next round if last enemy is defeated in this round
            this.set({
              roundNum: roundNum + 1,
              enemyNum: 0,
            });
          }
        } else {
          // Iterate to next enemy
          this.set({ enemyNum: enemyNum + 1 });
        }
        break;

      case ACTIONS.PLAYER_DEFEATED:
        this.set({
          status: STATUS.LOST,
        });
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
      status: STATUS.IN_PROGRESS,
    });
  }

  private set currentEnemy(_value: EnemyClass) {}
  private set status(_value: STATUS) {}
}
