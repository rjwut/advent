const knotHash = require('./knot-hash');

const GRID_SIZE = 128;

/**
 * # [Advent of Code 2017 Day 14](https://adventofcode.com/2017/day/14)
 *
 * The grid is represented by a one-dimensional array containing 16,384
 * elements, one for each cell of the grid. I chose to represent it this way
 * because the contents of the grid are simple, the size is known, it means I
 * only ever have to deal with a single array. It's easy to find the indexes of
 * the grid neighbors:
 *
 * - If the index is greater than or equal to `128`, it's not on the top row,
 *   so the index minus `128` is the index of the cell above it.
 * - If the index is less than the length of the array minus `128`, it's not on
 *   the bottom row, so the index plus `128` is the index of the cell below it.
 * - If the remainder of the index divided by `128` is not `0`, it's not on the
 *   left edge, so the index minus `1` is the index of the cell to the left.
 * - If the remainder of the index divided by `128` is not `127`, it's not on
 *   the right edge, so the index plus `1` is the index of the cell to the
 *   right.
 *
 * Populating the grid is also pretty easy, since I can re-use the logic from
 * the [Day 10 solution](./day-10.js), which I've broken off into a separate
 * module called [`knot-hash`](./knot-hash.js). For each row, I compute the
 * knot hash, break it into hex characters, and convert each hex character to
 * binary. I count the number of `1` bits and add that to a `used` counter
 * which will provide the answer to part one. Then I push those bits onto the
 * array.
 *
 * To find the number of regions, I simply iterate the array, and for every
 * `'1'` I find (the string, not the number), I perform a "flood fill"
 * operation. This is done by putting the starting index into a stack, and then
 * while the stack is not empty, I pop the index, and if the value in that cell
 * is `'1'` (the string), I replace it with the current region number and push
 * its neighbors' indexes onto the stack. At the end, all the `'1'`s have been
 * converted to their region numbers, and the next region number that would
 * have been assigned had there been another region is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  let used = 0;
  const cells = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    const hash = [ ...knotHash(`${input}-${r}`) ];
    hash.forEach(hexChar => {
      const binary = [ ...parseInt(hexChar, 16).toString(2).padStart(4, '0') ];
      used += binary.filter(c => c === '1').length;
      binary.forEach(bit => cells.push(bit));
    });
  }

  /**
   * Returns the indexes of the grid cells adjacent to the one with the given
   * index.
   *
   * @param {number} i - the index of the grid cell whose neighbors you want to
   * find
   * @returns {Array} - the neighbors' indexes
   */
  const getAdjacent = i => {
    const adjacent = [];

    if (i >= GRID_SIZE) {
      adjacent.push(i - GRID_SIZE);
    }

    if (i < cells.length - GRID_SIZE) {
      adjacent.push(i + GRID_SIZE);
    }

    const mod = i % GRID_SIZE;

    if (mod !== 0) {
      adjacent.push(i - 1);
    }

    if (mod !== GRID_SIZE - 1) {
      adjacent.push(i + 1);
    }

    return adjacent;
  };

  /**
   * Replaces all `'1'`s in the grid that are contiguous with the one in the
   * given index with the indicated region number. If the cell at `i` doesn't
   * contain a `'1'`, nothing happens.
   *
   * @param {number} i - the index of the cell to start the flood fill
   * operation
   * @param {number} regionNum - the region number to use
   */
  const flood = (i, regionNum) => {
    const stack = [ i ];

    do {
      const index = stack.pop();

      if (cells[index] === '1') {
        cells[index] = regionNum;
        getAdjacent(index).forEach(adjacentIndex => {
          stack.push(adjacentIndex);
        });
      }
    } while (stack.length);
  };

  /**
   * Returns the number of contiguous regions of `'1'`s in the grid. When this
   * function is complete, all `'1'`s in the grid will be replaced with their
   * region numbers.
   *
   * @returns {number} - the number of regions found
   */
  const countRegions = () => {
    let regionCount = 0;

    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === '1') {
        flood(i, regionCount++);
      }
    }

    return regionCount;
  };

  return [ used, countRegions() ];
};
