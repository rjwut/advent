const SimpleGrid = require('../simple-grid');

const WORD_TO_FIND = 'XMAS';
const DIRECTIONS = [
  [ -1, -1 ],
  [ -1,  0 ],
  [ -1,  1 ],
  [  0, -1 ],
  [  0,  1 ],
  [  1, -1 ],
  [  1,  0 ],
  [  1,  1 ],
];
const VALID_CORNERS = new Set(['MMSS', 'SMMS', 'SSMM', 'MSSM']);

/**
 * # [Advent of Code 2024 Day 4](https://adventofcode.com/2024/day/4)
 *
 * My `SimpleGrid` class came in clutch this time!
 *
 * Part one was pretty straightfoward: I used the `reduce()` method on `SimpleGrid` to iterate
 * through every cell in the grid, treating that as a potential starting point for the word `XMAS`.
 * For each cell, I then iterated the eight possible directions in which the word could appear. For
 * each of those drections, I iterated the four letters in `XMAS`, and computed the location of the
 * cell where that letter should appear. If that cell is not out of bounds and does contain the
 * desired letter, I increment the counter. The final count is the answer to part one.
 *
 * I was prepared to follow a similar approach for part two, but I realized that there is a faster
 * and easier way. There are only four valid `X-MAS` patterns:
 *
 * ```txt
 * M.M  S.M  S.S  M.S
 * .A.  .A.  .A.  .A.
 * S.S  S.M  M.M  M.S
 * ```
 *
 * So instead of trying to find diagonal `MAS` instances, then checking for another `MAS` that
 * crosses it, I instead can just search for `A`s that are surrounded by one of the four valid
 * patterns described above. Here's how I did it:
 *
 * 1. Iterate all cells in the grid that are not on the edge.
 * 2. Skip cells that do not contain the letter `A`.
 * 3. Grab the contents of the four cells diagonally adjacent to the current cell and concatenate
 *    them together in clockwise order.
 * 4. If the concatenated string is `MMSS`, `SMMS`, `SSMM`, or `MSSM`, this is a valid `X-MAS`
 *    pattern, so increment the counter.
 * 5. The final count is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });
  return [ part1, part2 ].map(fn => fn(grid));
};

/**
 * Find all instances of `XMAS` in the crossword.
 *
 * @param {SimpleGrid} grid - the crossword
 * @returns {number} - the number of instances of `XMAS` found
 */
const part1 = grid => grid.reduce((count, _, r, c) => {
  DIRECTIONS.forEach(([dr, dc]) => {
    let found = true;

    for (let i = 0; i < WORD_TO_FIND.length; i++) {
      const cr = r + i * dr;
      const cc = c + i * dc;

      if (!grid.inBounds(cr, cc) || grid.get(cr, cc) !== WORD_TO_FIND[i]) {
        found = false;
        break;
      }
    }

    if (found) {
      count++;
    }
  });
  return count;
}, 0);

/**
 * Find all the `X-MAS` patterns in the crossword.
 *
 * @param {SimpleGrid} grid - the crossword
 * @returns {number} - the number of `X-MAS` patterns
 */
const part2 = grid => {
  let count = 0;
  const rowCount = grid.rows - 2;
  const colCount = grid.cols - 2;
  grid.forEachInRegion(1, 1, rowCount, colCount, (letter, r, c) => {
    if (letter !== 'A') {
      return;
    }

    const corners = [
      grid.get(r - 1, c - 1),
      grid.get(r - 1, c + 1),
      grid.get(r + 1, c + 1),
      grid.get(r + 1, c - 1),
    ].join('');

    if (VALID_CORNERS.has(corners)) {
      count++;
    }
  });
  return count;
};
