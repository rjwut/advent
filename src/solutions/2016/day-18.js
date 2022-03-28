const RULES = [
  false, // ...
  true,  // ..^
  false, // .^.
  true,  // .^^
  true,  // ^..
  false, // ^.^
  true,  // ^^.
  false, // ^^^
]

/**
 * # [Advent of Code 2016 Day 18](https://adventofcode.com/2016/day/18)
 *
 * You don't have to keep the full grid of 40,000,000 tiles in memory. You only
 * need to keep the previous row of tiles. As each row is generated, you can
 * count the safe tiles right then and add it to a running total.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => solve(input, [ 40, 400000 ]);

/**
 * Returns an array containing the number of safe tiles for tile grids with the
 * indicated numbers of rows.
 *
 * @param {string} firstRow - the first row, using `.` and `^` characters
 * @param {Array} rowCounts - the row counts of the grids
 * @returns {Array} - the corresponding number of safe tiles
 */
const solve = (firstRow, rowCounts) => {
  firstRow = [ ...firstRow.trim() ].map(chr => chr === '.' ? false : true);
  return rowCounts.map(rowCount => countSafe(firstRow, rowCount));
};

/**
 * Computes the number of safe tiles in a tile grid with the indicated number
 * of rows.
 *
 * @param {Array} firstRow - an array of booleans, where `true` indicates a
 * trap
 * @param {number} rowsToGenerate - the number of rows for this grid
 * @returns {number} - the number of safe tiles
 */
const countSafe = (firstRow, rowsToGenerate) => {
  let prevRow = firstRow;
  let safeCount = firstRow.filter(tile => !tile).length;
  let rowCount = 1;

  while (rowCount < rowsToGenerate) {
    const nextRow = [];

    for (let i = 0; i < prevRow.length; i++) {
      const index = (prevRow[i - 1] ? 4 : 0) + (prevRow[i] ? 2 : 0) + (prevRow[i + 1] ? 1 : 0);
      const trapped = RULES[index];
      safeCount += trapped ? 0 : 1;
      nextRow.push(trapped);
    }

    prevRow = nextRow;
    rowCount++;
  }

  return safeCount;
};

module.exports.solve = solve;
