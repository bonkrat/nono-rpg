export function buildMinigrid(height, scale) {
  const minigrid = this.add.container(
    this.puzzle.puzzles.length * 2 + 32 * 2,
    height - 32 * scale * 2 - 32
  );

  minigrid
    .add(
      this.puzzle.puzzles.map((p, i) => {
        const s = this.add
          .sprite(
            i === 0 || i === 2 ? 0 : 32 * scale,
            i === 0 || i === 1 ? 0 : 32 * scale
          )
          .setScale(scale)
          .setOrigin(0, 0)
          .play(this.getEmptyAnimation());
        return s;
      })
    )
    .setAlpha(0.5);

  return minigrid;
}
