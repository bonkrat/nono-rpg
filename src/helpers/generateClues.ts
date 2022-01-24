/**
 * Calculates the groups of selected cells for the nonogram.
 * e.g., [0,1,2,4,5,6,9,10] becomes [3, 2, 2, 1].
 *
 * @param {array} cells cells to generate nonogram groups for.
 */
export default (cells: number[]) => {
  cells.sort((a, b) => a - b);
  const result = cells.reduce((acc: number[], curr, index) => {
    if (index && curr === cells[index - 1] + 1) {
      acc[acc.length - 1] += 1;
    } else {
      acc.push(1);
    }
    return acc;
  }, []);

  return !result.length ? [0] : result;
};
