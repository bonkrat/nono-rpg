export function buildMinigrid(height, width, scale, puzzleSet) {
  // const margin = (32 * scale * (index + 1)) / 2;
  const bottomAlign = (x) => x + height - 32 * scale - 32 * scale;
  const leftAlign = (x) => x + 32;

  return puzzleSet.map((puzz, index) => {
    const margin = 10 * index;
    const minigrid = this.add.container(
      leftAlign(
        this.puzzleSet.length * scale +
          32 * scale * index +
          margin * this.puzzleSet.length
      ),
      bottomAlign(32)
    );

    minigrid
      .add(
        puzz.puzzles.map((p, i) => {
          const s = this.add
            .sprite(
              i === 0 || i === 2 ? 0 : 32 * (scale / (puzz.puzzles.length / 2)),
              i === 0 || i === 1 ? 0 : 32 * (scale / (puzz.puzzles.length / 2))
            )
            .setOrigin(0, 0)
            .play(this.getEmptyAnimation());

          puzz.puzzles.length > 1
            ? s.setScale(scale / (puzz.puzzles.length / 2))
            : s.setScale(scale);
          return s;
        })
      )
      .setAlpha(0.5);

    return minigrid;
  });
}

const rightAlign = (x) =>
  x +
  (width -
    (this.puzzleSet.length * 32 * scale +
      ((this.puzzleSet.length + 1) * (32 * scale)) / 2));
