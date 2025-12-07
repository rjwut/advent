const SimpleGrid = require('../simple-grid');

/**
 * # [Advent of Code 2025 Day 7](https://adventofcode.com/2025/day/7)
 *
 * While it might be tempting to simulate each beam of light and timeline individually using a stack
 * or queue, this will get prohibitively expensive in part two. Instead, we can simply track each
 * column occupied by a beam of light as we iterate down the grid's rows. For each column with a
 * light beam, we store the number of timelines that have a beam in that column at that time. The
 * procedure for computing the answers to both parts in a single pass is as follows:
 *
 * 1. Create a `Map` to track the columns occupied by beams of light. The key will be the column
 *    index, and the value will be the number of timelines with a beam in that column. Initialize it
 *    with just one timeline at the starting column.
 * 2. Initialize a counter for the number of splits encountered (which will be used to compute the
 *    answer to part one).
 * 3. Iterate the grid row by row, starting from the row below the starting position and ending when
 *    we reach the bottom row. For each row:
 *    1. Create a new `Map` to track the columns for the next row.
 *    2. For each entry in the current column `Map`:
 *       - If the cell at that column is a splitter, increment the split counter, and add two
 *         entries to the new `Map`, one for the column to the left and one for one to the right,
 *         setting their values to the number of timelines from the current column. This represents
 *         that each of the timelines currently occupying this column have now been split into two
 *         separate timelines.)
 *       - Otherwise, add an entry for this to the new `Map` for this column, carrying over the
 *         number of timelines from the current column.
 *    3. Replace the current column `Map` with the new one.
 * 4. After processing all rows:
 *    - The split counter contains the answer to part one.
 *    - Sum the values in the final column `Map` to get the total number of timelines, which is the
 *      answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });
  const startCoords = grid.coordsOf('S');
  const lastRow = grid.rows - 1;
  let columns = new Map([ [ startCoords.c, 1 ] ]);
  let splits = 0;
  let newColumns;

  /**
   * Sets the number of timelines for a given column in the new columns `Map`.
   *
   * @param {number} c - the column index
   * @param {number} count - the number of timelines for that column
   */
  const setBeam = (c, count) => {
    newColumns.set(c, (newColumns.get(c) ?? 0) + count);
  };

  for (let r = startCoords.r + 1; r < lastRow; r++) {
    newColumns = new Map();

    for (const [ c, count ] of columns) {
      const cell = grid.get(r, c);

      if (cell === '^') {
        // Split all timelines where a beam occupies this column at this time
        splits++;
        setBeam(c - 1, count);
        setBeam(c + 1, count);
      } else {
        // These timelines don't split here; just propagate them down
        setBeam(c, count);
      }
    }

    columns = newColumns;
  }

  // We're at the bottom row, sum the timelines from all columns
  const timelines = columns.values().reduce((a, b) => a + b, 0);
  return [ splits, timelines ];
};
