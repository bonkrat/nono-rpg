import { flattenDeep } from "lodash";
import Phaser from "phaser";
import { letters } from "../../assets/sprites";
import { LoadableAssets, register } from "../../mixins/AssetLoader";
import { width } from "../../scenes/battle/constants";
import { scale as baseScale } from "../../scenes/battle/constants";

export class TextSprite {
  text: string;
  x: number;
  y: number;
  scale: number;
  tint: number;
  words: any;
  container: TextContainer;

  /**
   * Prints a string of animated text as Phaser Sprites with each word in its own container.
   *
   * @param scene The scene the text sprites will belong to
   * @param text The text to render, e.g. "Foobar baz qix"
   * @param x The x position to render the text at
   * @param y The y position to render the text at
   * @param scale The scale of all of text sprites
   * @param tint The tint of the letters. Useful for creating masks.
   * @param curve The curve to print the text along.
   * @returns TextSprite
   */
  constructor(
    scene: Phaser.Scene,
    text: string,
    x = 0,
    y = 0,
    scale = baseScale,
    tint = 0xffffff,
    curve?: Phaser.Curves.Line
  ) {
    this.text = text;
    this.words = text.split(" ").map((word: string) => word.split(""));
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.tint = tint;

    const containers = this.words.reduce(
      (acc: WordContainer[], letters: string[], currIndex: number) => {
        const path = { t: 0, vec: new Phaser.Math.Vector2() };
        let textCurve;

        if (!curve) {
          const startPoint = new Phaser.Math.Vector2(x, y);
          const endPoint = new Phaser.Math.Vector2(width, y);
          textCurve = new Phaser.Curves.Line(startPoint, endPoint);
        } else {
          textCurve = curve;
        }

        const xPos = textCurve.getPoint(
          currIndex / this.words.length,
          path.vec
        );

        const wordContainer = scene.add.container(
          xPos.x,
          xPos.y,
          letters.map((letter, i) => {
            const sprite = scene.add
              .sprite(i * (32 * this.scale), 0, "letter_" + letter)
              .setTint(tint)
              .setVisible(false)
              .setName("letter_" + letter)
              .setScale(this.scale);

            return sprite;
          })
        ) as WordContainer;

        acc.push(wordContainer);

        return acc;
      },
      []
    );

    this.container = scene.add.container(
      this.x,
      this.y,
      containers
    ) as TextContainer;

    return this;
  }

  setAlpha(alpha: number) {
    this.forEach((s) => s.setAlpha(alpha));
  }

  /**
   * Sets tint for all text letter sprites.
   *
   * @param tint
   */
  setTint(tint: number) {
    this.forEach((s) => s.setTint(tint));
  }

  /**
   * Sets all containers visibility.
   */
  setVisible(visible: boolean) {
    this.forEach((s) => s.setVisible(visible));
  }

  /**
   * Get the bounds of all of letters.
   *
   * @returns
   */
  getBounds() {
    return this.container.getBounds();
  }

  /**
   * Destroys all of the containers and their contained text sprites.
   */
  destroy() {
    this.container.destroy();
  }

  /**
   * Applies provided callback to each letter sprite in the text.
   *
   * @param cb callback to apply to each letter Sprite
   * @returns {Phaser.GameObjects.Sprite[]} array of all of the letter sprites.
   */
  map(...args: Parameters<TextSprite["forEach"]>): Phaser.GameObjects.Sprite[] {
    this.forEach(...args);
    return letters;
  }

  /**
   * Applies provided callback to each letter sprite in the text.
   *
   * @param cb callback to apply to each letter Sprite
   */
  forEach(cb: (l: Phaser.GameObjects.Sprite) => void) {
    const letters = this.getLetters();
    letters.forEach(cb);
  }

  /**
   * Get all of the Sprite objects of the text. Useful for setting properties on every sprite object.
   * @returns Phaser.GameObjects.Sprite[]
   */
  getLetters() {
    return flattenDeep(
      this.container
        .getAll()
        .map((wordContainer) =>
          wordContainer.getAll().map((letterSprite) => letterSprite)
        )
    );
  }

  /**
   * Offset the text containers from their original position.
   *
   * @param x the amount to offset horizontally
   * @param y the amount to offset vertically
   */
  setOffset(x: number, y?: number) {
    const xPos = x ? this.container.x + x : this.container.x;
    const yPos = y ? this.container.y + y : this.container.y;
    this.container.setPosition(xPos, yPos);
  }
}

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
    textSprite.forEach((s) => {
      s.setVisible(true);
      s.play(s.name);
    });
  }
);
