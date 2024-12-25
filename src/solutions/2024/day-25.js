const SimpleGrid = require('../simple-grid');

/**
 * # [Advent of Code 2024 Day 25](https://adventofcode.com/2024/day/25)
 *
 * The grids in the input are separated by double newlines, then each one is fed into `SimpleGrid`
 * to create a grid for each key and lock. Then iterate the columns and count the number of `#`
 * characters in it (minus the top and bottom rows). If there's a `#` in the top-left corner, the
 * grid is a lock, otherwise it's a key. Each lock or key is then represented by an object with a
 * `type` property to say what type of object it is, and a `values` property that contains the array
 * of counts for each column.
 *
 * The `match()` method then compares each key against each lock. To be a fit, the sum of each
 * column value in each key/lock pair must not exceed the height of the grid minus two. We count
 * how many fits we find in all combinations to produce the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grids = input.split('\n\n')
    .map(grid => new SimpleGrid({ data: grid }));
  const sum = grids[0].rows - 2;
  const patterns = grids.map(processGrid);
  return [ match(patterns, sum), undefined ];
};

/**
 * Processes the given `SimpleGrid` to produce an object representing a key or lock. The returned
 * object has two properties:
 *
 * - `type: string`: Either `'key'` or `'lock'`
 * - `values: number[]`: The size of each tumbler column
 *
 * @param {SimpleGrid} grid - the input grid
 * @returns {Object} - the key or lock object
 */
const processGrid = grid => {
  const values = [];
  let type, r0, r1, dr;

  if (grid.get(0, 0) === '#') {
    type = 'lock';
    r0 = 1;
    r1 = grid.rows - 1;
    dr = 1;
  } else {
    type = 'key';
    r0 = grid.rows - 2;
    r1 = 0;
    dr = -1;
  }

  for (let c = 0; c < grid.cols; c++) {
    let value = 0;

    for (let r = r0; r !== r1; r += dr) {
      if (grid.get(r, c) === '#') {
        value++;
      } else {
        break;
      }
    }

    values.push(value);
  }

  return { type, values };
};

/**
 * Compares all keys and locks.
 *
 * @param {Object[]} patterns - the key and lock objects
 * @param {number} sum - the maximum allowed sum for each column to constitute a fit
 * @returns {number} - the number of fitting key/lock pairs
 */
const match = (patterns, sum) => {
  const { key: keys, lock: locks } = Object.groupBy(patterns, ({ type }) => type);
  let matchCount = 0;

  do {
    const key = keys.pop();
    let i;

    for (i = 0; i < locks.length; i++) {
      const lock = locks[i];
      let matches = true;

      for (let j = 0; j < key.values.length; j++) {
        if (key.values[j] + lock.values[j] > sum) {
          matches = false;
          break;
        }
      }

      if (matches) {
        matchCount++;
      }
    }
  } while (keys.length);

  return matchCount;
};
