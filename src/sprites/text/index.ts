import Phaser from "phaser";
import letters from "../../assets/sprites/letters.png";

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
    scale: number
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

    return text.split("").map((letter, i) =>
      this.scene.add
        .sprite(x + i * (32 * scale), y, letter)
        .play("letter_" + letter)
        .setScale(scale)
    );
  }
);
