const SimpleGrid = require('../simple-grid');

const Direction = {
  NORTH: [ -1,  0 ],
  WEST:  [  0, -1 ],
  SOUTH: [  1,  0 ],
  EAST:  [  0,  1 ],
};
const CYCLE = Object.values(Direction);
const CYCLE_COUNT = 1_000_000_000;

/**
 * # [Advent of Code 2023 Day 14](https://adventofcode.com/2023/day/14)
 *
 * Part one is simple enough:
 *
 * 1. Read the input as a two-dimensional grid.
 * 2. Iterate the round stones from north to south.
 *    1. Scan north of the stone's location until we encounter an obstacle or the edge of the
 *       platform.
 *    2. Delete the stone from it's previous location and place it in its new location.
 * 3. Iterate the stones again, this time summing the load for each one.
 *
 * The sum load value at the end is the answer for part one.
 *
 * Part two is more complex:
 *
 * - The platform must be able to be tilted in any of the cardinal directions.
 * - We have to report the load after tilting the platform in each direction 1,000,000,000 times.
 *
 * Just straight up simulating that many cycles would take too long, but the platform eventually
 * settles into a repeating pattern of states (a supercycle, if you will). When we discover the
 * point where that supercycle begins and how long it is, we can calculate how many supercycles can
 * complete before the last cycle. We can then compute how far into the supercycle we'll be when
 * the last cycle is executed, and go look up the state at that point in the supercycle.
 *
 * The algorithm looks like this:
 *
 *  1. Create variables for the cycle count and the start of the supercycle.
 *  2. Create an array to store the previously seen platform states.
 *  3. Add the current platform state to the array of seen states.
 *  4. Execute a cycle (tilt north, then west, then south, then east).
 *  5. Produce a string representing the platform state.
 *  6. Check if the state string is in the array of seen states. If so, go to step 9.
 *  7. Push the state string onto the seen states array.
 *  8. Go to step 4.
 *  9. The index in the array of seen states where the previous state was found is the start of the
 *     supercycle, and all the states after that constitute the other states in the supercycle. You
 *     can thus compute the length of the supercycle.
 * 10. Calculate how many supercycles can be completed from the start of the first supercycle to
 *     the limit of 1,000,000,000 cycles.
 * 11. Calculate how many cycles will have been performed after completing that many supercycles.
 * 12. Calculate the offset into the supercycle where the last cycle will be performed.
 * 13. Being sure to adjust for the initial number of cycles before the first supercycle began,
 *     look up that offset in the array of seen states. This is the final state of the platform.
 * 14. Use that final state to compute the load. This is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ part1(input), part2(input) ];

/**
 * Find the answer to part 1.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the load after tilting the platform north
 */
const part1 = input => {
  const platform = new Platform(input);
  platform.tilt(Direction.NORTH);
  return platform.load;
};

/**
 * Find the answer to part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the load after performing 1,000,000,000 cycles
 */
const part2 = input => {
  let superCycleStart;
  const platform = new Platform(input);
  const seen = [ platform.toString() ];

  do { // Loop until we discover the supercycle
    CYCLE.forEach(direction => platform.tilt(direction));
    const platformStr = platform.toString();
    superCycleStart = seen.indexOf(platformStr);

    if (superCycleStart !== -1) {
      break;
    }

    seen.push(platformStr);
  } while (true);

  // Look up the final state's position in the supercycle
  const superCycleLength = seen.length - superCycleStart;
  const superCycleCount = Math.floor((CYCLE_COUNT - superCycleStart) / superCycleLength);
  const superCycleRemainderStart = superCycleStart + (superCycleCount * superCycleLength);
  const offset = superCycleStart + CYCLE_COUNT - superCycleRemainderStart;
  const finalPlatform = new Platform(seen[offset]);
  return finalPlatform.load;
};

/**
 * The `Platform` class represents the platform as a two-dimensional grid of cells. The class
 * extends `SimpleGrid`, and adds functionality for tilting the platform and computing its load.
 */
class Platform extends SimpleGrid {
  /**
   * Parse the puzzle input.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    super({ data: input });
  }

  /**
   * @returns {number} - the load on the `Platform`
   */
  get load() {
    return this.reduce((load, cell, r) => load + (cell === 'O' ? this.rows - r : 0), 0);
  }

  /**
   * Tilts the `Platform` in the indicated direction.
   *
   * @param {Array<number>} direction - the direction to tilt the `Platform`
   */
  tilt(direction) {
    const [ dr, dc ] = direction;

    if (direction[0] === 0) { // horizontal
      const c0  = dc === -1 ? 0 : this.cols - 1;
      const c1  = dc === -1 ? this.cols : -1;

      for (let c = c0; c !== c1; c -= dc) {
        for (let r = 0; r < this.rows; r++) {
          if (this.get(r, c) === 'O') {
            this.#roll({ r, c }, direction);
          }
        }
      }
    } else { // vertical
      const r0 = dr === -1 ? 0 : this.rows - 1;
      const r1 = dr === -1 ? this.rows : -1;

      for (let r = r0; r !== r1; r -= dr) {
        for (let c = 0; c < this.cols; c++) {
          if (this.get(r, c) === 'O') {
            this.#roll({ r, c }, direction);
          }
        }
      }
    }
  }

  /**
   * Rolls an individual stone on the `Platform` until it is stopped.
   *
   * @param {Object} param0 - the stone's location
   * @param {number} param0.r - the stone's row
   * @param {number} param0.c - the stone's column
   * @param {Array<number>} direction - the direction to roll the stone
   */
  #roll({ r, c }, direction) {
    const [ dr, dc ] = direction;

    if (direction[0] === 0) { // horizontal
      let c0 = c;
      let c1 = dc === -1 ? 0 : this.cols - 1;

      while (c !== c1 && this.get(r, c + dc) === '.') {
        c += dc;
      }

      this.set(r, c0, '.');
      this.set(r, c, 'O');
    } else { // vertical
      let r0 = r;
      let r1 = dr === -1 ? 0 : this.rows - 1;

      while (r !== r1 && this.get(r + dr, c) === '.') {
        r += dr;
      }

      this.set(r0, c, '.');
      this.set(r, c, 'O');
    }
  }
}
