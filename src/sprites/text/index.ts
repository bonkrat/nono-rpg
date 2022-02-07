import Phaser from "phaser";
import { letters } from "../../assets/sprites";

const letterMap = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
].reduce(
  (
    acc: {
      [k: string]: number;
    },
    curr: string,
    i: number
  ) => {
    acc[curr] = i;
    acc[curr.toUpperCase()] = i;

    return acc;
  },
  {}
);

Phaser.GameObjects.GameObjectFactory.register(
  "textsprite",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    text: string,
    x: number,
    y: number,
    scale: number,
    tint = 0xffffff
  ) {
    if (!this.scene.anims.get("letter_a")) {
      Object.keys(letterMap).forEach((l) => {
        this.scene.load.spritesheet("letter_" + l, letters, {
          frameWidth: 32,
          frameHeight: 32,
          startFrame: letterMap[l],
        });
      });

      Object.keys(letterMap).forEach((l: string) => {
        this.scene.anims.create({
          key: "letter_" + l,
          frames: this.scene.anims.generateFrameNumbers("letters", {
            frames: [0, 1, 2].map((n) => n + letterMap[l] * 3),
          }),
          frameRate: 3,
          repeat: -1,
        });
      });
    }

    const words = text.split(" ").map((word: string) => word.split(""));
    const wordsContainer = this.scene.add.container(
      0,
      0,
      words.reduce(
        (
          acc: Phaser.GameObjects.Container[],
          letters: string[],
          currIndex: number
        ) => {
          const path = { t: 0, vec: new Phaser.Math.Vector2() };
          const startPoint = new Phaser.Math.Vector2(x, y - 30);
          var controlPoint1 = new Phaser.Math.Vector2(x + 50, y - 20);
          var controlPoint2 = new Phaser.Math.Vector2(x + 100, y);
          var endPoint = new Phaser.Math.Vector2(x - 50, y + 20);
          var curve = new Phaser.Curves.CubicBezier(
            startPoint,
            controlPoint1,
            controlPoint2,
            endPoint
          );
          const xPos = curve.getPoint(currIndex / words.length, path.vec);
          const container = this.scene.add.container(
            xPos.x,
            xPos.y,
            letters.map((letter, i) => {
              const sprite = this.scene.add
                .sprite(i * (32 * scale), 0, letter)
                .setTint(tint)
                .play("letter_" + letter)
                .setScale(scale);

              return sprite;
            })
          );

          acc.push(container);
          return acc;
        },
        []
      ) as Phaser.GameObjects.Container[]
    );

    return wordsContainer;
  }
);
