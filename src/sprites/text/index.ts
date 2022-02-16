import { flattenDeep } from "lodash";
import Phaser from "phaser";
import { letters } from "../../assets/sprites";
import { LoadableAssets, register } from "../../mixins/AssetLoader";
import { width } from "../../scenes/battle/constants";

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

const assets = Object.keys(letterMap).map((l) => {
  return {
    spriteConfig: {
      url: letters,
      key: "letter_" + l,
      frameWidth: 32,
      frameHeight: 32,
      startFrame: letterMap[l],
    },
    animation: function (scene: Phaser.Scene) {
      return {
        key: "letter_" + l,
        frames: scene.anims.generateFrameNumbers("letter_" + l, {
          frames: [0, 1, 2].map((n) => n + letterMap[l] * 3),
        }),
        frameRate: 3,
        repeat: -1,
      };
    },
  };
});

export class TextSprite {
  text: string;
  x: number;
  y: number;
  scale: number;
  tint: number;
  words: any;
  containers: Phaser.GameObjects.Container[];

  constructor(
    scene: Phaser.Scene,
    text: string,
    x: number,
    y: number,
    scale: number,
    tint = 0xffffff,
    curve?: Phaser.Curves.Line
  ) {
    this.text = text;
    this.words = text.split(" ").map((word: string) => word.split(""));
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.tint = tint;

    this.containers = this.words.reduce(
      (
        acc: Phaser.GameObjects.Container[],
        letters: string[],
        currIndex: number
      ) => {
        const path = { t: 0, vec: new Phaser.Math.Vector2() };
        let textCurve;

        if (!curve) {
          const startPoint = new Phaser.Math.Vector2(0, y);
          const endPoint = new Phaser.Math.Vector2(width, y);
          textCurve = new Phaser.Curves.Line(startPoint, endPoint);
        } else {
          textCurve = curve;
        }

        const xPos = textCurve.getPoint(
          currIndex / this.words.length,
          path.vec
        );

        const container = scene.add.container(
          xPos.x,
          xPos.y,
          letters.map((letter, i) => {
            const sprite = scene.add
              .sprite(i * (32 * this.scale), 0, "letter_" + letter)
              .setVisible(false)
              .setName("letter_" + letter)
              .setScale(this.scale);

            return sprite;
          })
        );

        acc.push(container);
        return acc;
      },
      []
    ) as Phaser.GameObjects.Container[];

    return this;
  }

  destroy() {
    this.containers.forEach((container) => container.destroy());
  }

  getLetters(): Phaser.GameObjects.Sprite[] {
    return flattenDeep(
      this.containers.map((word) =>
        word
          .getAll()
          .map((letterSprite) => letterSprite as Phaser.GameObjects.Sprite)
      )
    );
  }
}

register<TextSprite>(
  "textsprite",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    text: string,
    x: number,
    y: number,
    scale: number,
    tint = 0xffffff,
    curve: Phaser.Curves.Line
  ) {
    const LoadableTextSprite = LoadableAssets(TextSprite, assets, "TextSprite");
    const sprite = new LoadableTextSprite(
      this.scene,
      text,
      x,
      y,
      scale,
      tint,
      curve
    );

    return sprite;
  },
  function (textSprite) {
    textSprite.getLetters().forEach((s) => {
      s.setVisible(true);
      s.play(s.name);
    });
  }
);
