const { parseGrid } = require('../util');

/**
 * # [Advent of Code 2021 Day 11](https://adventofcode.com/2021/day/11)
 *
 * Running a single step in the simulation is done like this:
 *
 * - Start a flash counter at `0`.
 * - Create a queue of cells to increment.
 * - Push all the cells onto the queue.
 * - While the queue is not empty:
 *   - Take a cell from the queue and increment its value.
 *   - If the value is exactly `10`, enqueue all its neighbors and increment
 *     the flash counter.
 * - Set all cells whose values are greater than `9` to `0`.
 * - Return the flash counter.
 *
 * For part one, we run the simulation for `100` steps and sum the returned
 * flash counters. For part two, we keep running the simulation until the
 * returned flash counter equals the number of cells in the grid, then return
 * the step number. Both parts of the puzzle can be computed in a single pass.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const step = buildGrid(input);
  let first100Count = 0;
  let firstSynchronizedFlash;
  let i = 0;

  do {
    const result = step();

    if (i++ < 100) {
      first100Count += result.stepFlashCount;
    }

    if (result.synchronized && !firstSynchronizedFlash) {
      firstSynchronizedFlash = i;
    }
  } while (i < 100 || !firstSynchronizedFlash);

  return [ first100Count, firstSynchronizedFlash ];
};

/**
 * Parses the input and returns a function which will run a single step of the
 * simulation. (See `step()` below.)
 *
 * @param {string} input - the puzzle input
 * @returns {Function} - the simulation step function
 */
const buildGrid = input => {
  const grid = parseGrid(input, { parseInt: true });
  const count = grid.length * grid[0].length;
  const toIncrement = [];
  let stepFlashCount;

  /**
   * Performs a single step of the simulation.
   *
   * - `stepFlashCount` (number): the number of cells that flashed in the step
   * - `synchronized` (boolean): whether all cells flashed in this step
   *
   * @returns {Object} - the results of the step
   */
  const step = () => {
    stepFlashCount = 0;
    iterate((r, c) => {
      toIncrement.push([ r, c ]);
    });

    while (toIncrement.length) {
      const [ r, c ] = toIncrement.shift();
      increment(r, c);
    }

    iterate((r, c) => {
      if (grid[r][c] > 9) {
        grid[r][c] = 0;
      }
    });
    return {
      stepFlashCount,
      synchronized: stepFlashCount === count,
    };
  };

  /**
   * Iterates each cell in the grid and invokes the given callback function
   * with their coordinates.
   *
   * @param {Function} fn - the callback function
   */
  const iterate = fn => {
    for (let r = 0; r < grid.length; r++) {
      const len = grid[r].length;
  
      for (let c = 0; c < len; c++) {
        fn(r, c);
      }
    }
  };

  /**
   * Iterates the neighbors of the given cell and invokes the given callback
   * with their coordinates.
   *
   * @param {number} r - the row of the cell
   * @param {number} c - the column of the cell
   * @param {Function} fn - the callback function
   */
  const iterateNeighbors = (r, c, fn) => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) {
          const r1 = r + dr;
          const c1 = c + dc;
  
          if (r1 >= 0 && r1 < grid.length && c1 >= 0 && c1 < grid[r1].length) {
            fn(r + dr, c + dc);
          }
        }
      }
    }
  };

  /**
   * Increments the given cell. If this results in a flash, the step flash
   * count is incremented and all neighbors are enqueued to be incremented.
   *
   * @param {number} r - the row of the cell
   * @param {number} c - the column of the cell
   */
  const increment = (r, c) => {
    const value = ++grid[r][c];
    grid[r][c] = value;

    if (value === 10) {
      stepFlashCount++;
      iterateNeighbors(r, c, (r1, c1) => {
        toIncrement.push([ r1, c1 ]);
      });
    }
  };

  return step;
};
