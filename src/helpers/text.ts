import letters from "../assets/sprites/letters.png";

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

export function addText(
  scene: Phaser.Scene,
  text: string,
  x: number,
  y: number,
  scale: number
) {
  text.split("").map((letter, i) => {
    scene.add
      .sprite(x + i * (32 * scale), y, letter)
      .play("letter_" + letter)
      .setScale(scale);
  });
}

export function loadFontFace(scene: Phaser.Scene) {
  Object.keys(letterMap).forEach((l) => {
    scene.load.spritesheet("letter_" + l, letters, {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: letterMap[l],
    });
  });
}

export function addFontAnims(scene: Phaser.Scene) {
  Object.keys(letterMap).forEach((l: string) => {
    scene.anims.create({
      key: "letter_" + l,
      frames: scene.anims.generateFrameNumbers("letters", {
        frames: [0, 1, 2].map((n) => n + letterMap[l] * 3),
      }),
      frameRate: 3,
      repeat: -1,
    });
  });
}
