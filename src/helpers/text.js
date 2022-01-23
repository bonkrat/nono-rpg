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
].reduce((acc, curr, i) => {
  acc[`${curr}`] = i;
  acc[`${curr.toUpperCase()}`] = i;

  return acc;
}, {});

export function addText(text, x, y, scale) {
  text.split("").map((letter, i) => {
    this.add
      .sprite(x + i * (32 * scale), y, letter)
      .play("letter_" + letter)
      .setScale(scale);
  });
}

export function loadFontFace() {
  Object.keys(letterMap).forEach((l) => {
    this.load.spritesheet("letter_" + l, letters, {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: letterMap[l],
    });
  });
}

export function addFontAnims() {
  Object.keys(letterMap).forEach((l) => {
    this.anims.create({
      key: "letter_" + l,
      frames: this.anims.generateFrameNumbers("letters", {
        frames: [0, 1, 2].map((n) => n + Number.parseInt(letterMap[l]) * 3),
      }),
      frameRate: 3,
      repeat: -1,
    });
  });
}
