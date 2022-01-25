const SummedAreaTable = require('../summed-area-table');

const TABLE_SIZE = 300;

/**
 * # [Advent of Code 2018 Day 11](https://adventofcode.com/2018/day/11)
 *
 * This solution makes use of the `summed-area-table` module. The
 * `SummedAreaTable` class defined in that module facilitates the rapid
 * computation of the sum of a rectangular array of cells in a 2D array. For
 * details about its implementation, see the documentation for that class.
 *
 * One thing to note is that the coordinates in the problem are 1-based, but
 * JavaScript arrays are 0-based. We must account for that when accessing
 * values.
 *
 * Algorithm:
 *
 * 1. Populate a table with the power values for all the cells.
 * 2. Create a `SummedAreaTable` instance for that table.
 * 3. Compute the highest power block for every size from `1` to `300`:
 *    1. Set a variable `limit` to equal the largest coordinate for the
 *       top-left corner of a block of the current size that will fit in the
 *       table (`300 - size + 1`).
 *    2. Iterate all table cells whose coordinates on both axes range from `1`
 *       to `limit`, inclusive.
 *    3. For each cell, find the sum for a block of the current size whose
 *       upper-left corner is at that cell. `SummedAreaTable.getSum()` does
 *       this for you.
 *    4. If it's the highest sum seen so far, remember coordinates and sum for
 *       that block.
 *    5. After iterating all coordinates, store the highest block in an array.
 * 4. For part one, find the highest power block computed for size `3`.
 *    Concatenate its coordinates to get the answer.
 * 5. For part two, find the highest power block in the entire array.
 *    Concatenate its coordinates and size to get the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, coords, size = 1) => {
  const serial = parseInt(input.trim(), 10);
  const table = buildTable(serial);

  if (coords) {
    if (size === 1) {
      return table.getPower(coords[0], coords[1]);
    }

    return table.getPowerBlock(coords[0], coords[1], size);
  }

  const sizes = [];

  for (let size = 1; size <= TABLE_SIZE; size++) {
    sizes.push(table.getHighestPowerBlockOfSize(size));
  }

  return [ part1, part2 ].map(part => part(sizes));
};

/**
 * Returns the coordinates for the highest power block found for size `3`.
 *
 * @param {Array} sizes - an array containing the highest power block found in
 * each size
 * @returns {string} - the coordinates of the block
 */
const part1 = sizes => {
  const highest = sizes[2];
  return `${highest.y},${highest.x}`;
}

/**
 * Returns the coordinates and size for the highest power block found of any
 * size.
 *
 * @param {Array} sizes - an array containing the highest power block found in
 * each size
 * @returns {string} - the coordinates and size of the block
 */
const part2 = sizes => {
  const highest = sizes.reduce((highest, size) => {
    return size.power > highest.power ? size : highest;
  }, { power: -Infinity });
  return `${highest.y},${highest.x},${highest.size}`;
}

/**
 * Builds the power table, then a summed area table for the power table, then
 * returns an API to perform lookups for both.
 *
 * @param {number} serial - the serial number of the power grid 
 * @returns {Object} - the lookup API
 */
const buildTable = serial => {
  /**
   * Computes the power level for a cell.
   *
   * @param {number} x - the cell's X coordinate
   * @param {number} y - the cell's Y coordinate
   * @returns {number} - the cell's power level
   */
  const computePower = (x, y) => {
    const rackId = x + 10;
    const power = (rackId * y + serial) * rackId;
    return Math.floor(power / 100) % 10 - 5;
  };

  // Populate power table
  const powerTable = new Array(TABLE_SIZE);

  for (let r = 1; r <= TABLE_SIZE; r++) {
    const tableRow = new Array(TABLE_SIZE);
    powerTable[r - 1] = tableRow;

    for (let c = 1; c <= TABLE_SIZE; c++) {
      tableRow[c - 1] = computePower(c, r);
    }
  }

  // Build the SummedAreaTable and lookup API
  const sat = new SummedAreaTable(powerTable);
  const api = {
    /**
     * Returns the power level of the cell located at the given coordinates.
     *
     * @param {number} x - the cell's X coordinate
     * @param {number} y - the cell's Y coordinate
     * @returns {number} - the cell's power level
     */
    getPower: (x, y) => powerTable[y - 1][x - 1],

    /**
     * Returns the sum of the power levels of the block of cells whose
     * upper-left corner is located at the given coordinates and whose size is
     * equal to the given size.
     *
     * @param {number} x - the X coordinate of the block's upper-left corner
     * @param {number} y - the X coordinate of the block's upper-left corner
     * @param {number} size - the block's size
     * @returns {number} - the sum of the power levels of all the cells in the
     * block
     */
    getPowerBlock: (x, y, size) => {
      if (size === 1) {
        return powerTable[y - 1][x - 1];
      }

      return sat.getSum(y - 1, x - 1, size, size);
    },

    /**
     * Returns the block of the given size that has the highest power sum. The
     * returned object has the following properties:
     *
     * - `x`: the X coordinate of the block's upper-left corner
     * - `y`: the Y coordinate of the block's upper-left corner
     * - `size`: the block's size
     * - `power`: the sum of the power levels of all the cells in the block
     *
     * @param {number} size - the block's size
     * @returns {Object} - the block with the highest power sum
     */
    getHighestPowerBlockOfSize: size => {
      let highest = { power: -Infinity };
      const limit = TABLE_SIZE - size + 1;

      for (let y = 1; y <= limit; y++) {
        for (let x = 1; x <= limit; x++) {
          const power = api.getPowerBlock(y, x, size);

          if (power > highest.power) {
            highest = { x, y, size, power };
          }
        }
      }

      return highest;
    },
  };
  return api;
};
