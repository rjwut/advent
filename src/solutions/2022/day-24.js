const SimpleGrid = require('../simple-grid');
const aStar = require('../a-star');
const { add } = require('../math2');

const STORM_DIRECTIONS = {
  '^': [ -1,  0 ],
  '>': [  0,  1 ],
  'v': [  1,  0 ],
  '<': [  0, -1 ],
};
const ELF_DIRECTIONS = [
  ...Object.values(STORM_DIRECTIONS),
  [ 0, 0 ],
].map(coords => [ ...coords, 1 ]);

/**
 * # [Advent of Code 2022 Day 24](https://adventofcode.com/2022/day/24)
 *
 * It is helpful to think of the valley not as a two-dimensional maze with moving walls, but rather
 * a three-dimensional maze with static walls, with the third dimension being time. This allows
 * traditional path-seeking algorithms like A* to work. The core functionality to make this work
 * was the `isSafe()` method of the `Valley` class, which accepts a set of three-dimensional
 * coordinates and returns whether it's safe to move there (not occupied by a wall or blizzard).
 *
 * In order to be able to do this, I had to be able to compute the locations of the blizzards.
 * I represented every location in the valley with an integer, and created a `Blizzard` class that
 * allows you to feed it a time and get back the integer representing the blizzard's location at
 * that time. I could then compute all safe locations at a given time index by first adding all the
 * location indexes into a `Set` of safe locations, then removing all the ones where a blizzard is
 * computed to be at that time. The resulting safe location `Set` is cached so future queries need
 * only consult the already-computed `Set`. All of this functionality was encapsulated within the
 * `Valley` or `Blizzard` classes.
 *
 * I could now create a `navigate()` function that would allow me to specify a start and goal
 * location and compute the time index at which I arrive at the goal. For part one, the start node
 * is the entrance to the valley at time index `0`, and the goal is any node located at the exit to
 * the valley at any time index. This is fed into my existing A* function, using the Manhattan
 * distance between the current and goal locations for the heuristic.
 *
 * For part two, I simply run `navigate()` twice more, once for the leg from the exit back to the
 * entrance, and then again from the entrance to the exit. I added an argument to specify the time
 * index for the start so that blizzard positions would be correct for each leg.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const valley = new Valley(input);
  const start = [ -1, 0 ];
  const goal = [ valley.rows, valley.cols - 1 ];
  const leg1 = navigate(valley, start, goal);
  const leg2 = navigate(valley, goal, start, leg1);
  const leg3 = navigate(valley, start, goal, leg2);
  return [ leg1, leg3 ];
};

/**
 * Determine the earliest time index at which you can navigate from the start to the end locations,
 * assuming you start at the time `t0`.
 *
 * @param {Valley} valley - the `Valley` instance that stores the blizzard information
 * @param {Array<number>} start - the spacial coordinates of the starting location
 * @param {Array<number>} goal - the spacial coordinates of the goal location
 * @param {number} t0 - the starting time index
 * @returns {number} - the time index when you arrive at `goal`
 */
const navigate = (valley, start, goal, t0 = 0) => {
  const startKey = start.join(',') + ',' + t0;
  const goalKeyPrefix = goal.join(',') + ',';
  const goalFn = key => key.startsWith(goalKeyPrefix);
  const getEdges = node => {
    const coords = node.split(',').map(Number);
    return ELF_DIRECTIONS.map(
      delta => coords.map((coord, i) => coord + delta[i])
    ).filter(
      next => valley.isSafe(next)
    ).map(next => ({ node: next.join(',') }));
  };
  const heuristic = node => {
    const coords = node.split(',').map(Number).slice(0, 2);
    return add(coords.map((coord, i) => Math.abs(coord - goal[i])));
  };
  const result = aStar(
    startKey,
    goalFn,
    getEdges,
    heuristic,
  );
  return parseInt(result.path[result.path.length - 1].split(',')[2], 10);
};

/**
 * Represents the valley and its blizzards.
 */
class Valley {
  #blizzards;
  #rows;
  #cols;
  #indexLimit;
  #safe;

  /**
   * Create the `Valley` from the given input grid.
   *
   * @param {string} input - the input
   */
  constructor(input) {
    const grid = new SimpleGrid({ data: input });
    this.#rows = grid.rows - 2;
    this.#cols = grid.cols - 2;
    this.#indexLimit = this.#rows * this.#cols;
    this.#blizzards = [];
    const rLimit = grid.rows - 1;
    const cLimit = grid.cols - 1;

    for (let r = 1; r < rLimit; r++) {
      for (let c = 1; c < cLimit; c++) {
        const chr = grid.get(r, c);
        const dir = STORM_DIRECTIONS[chr];

        if (dir) {
          this.#blizzards.push(new Blizzard(this.#rows, this.#cols, r - 1, c - 1, dir));
        }
      }
    }

    this.#safe = [];
    this.#computeSafeSpots(0);
  }

  /**
   * @returns {number} - the number of rows in the valley interior
   */
  get rows() {
    return this.#rows;
  }

  /**
   * @returns {number} - the number of columns in the valley interior
   */
  get cols() {
    return this.#cols;
  }

  /**
   * Given the spacial and temporal coordinates of a location, returns whether it is safe to be
   * there at that time.
   *
   * @param {Array<number} param0 - the coordinates (row, column, time)
   * @returns {boolean} - whether that location is safe
   */
  isSafe([ r, c, t ]) {
    // Make sure we've computed all safe locations through the given time index
    for (let i = this.#safe.length; i <= t; i++) {
      this.#computeSafeSpots(t);
    }

    // Valley entrance and exit are safe
    if (r === -1 && c === 0 || r === this.#rows && c === this.#cols - 1) {
      return true;
    }

    // Out of bounds is unsafe
    if (r < 0 || r >= this.#rows || c < 0 || c >= this.#cols) {
      return false;
    }

    // In a blizzard is unsafe
    return this.#safe[t].has(this.#computeIndex(r, c));
  }

  /**
   * Given the spacial coordinates of a location in the valley interior, return the corresponding
   * index.
   *
   * @param {number} r - the row coordinate
   * @param {number} c - the column coordinate
   * @returns {number} - the index
   */
  #computeIndex(r, c) {
    return r * this.#cols + c;
  }

  /**
   * Computes the spacial indices of all safe locations in the valley at the given time index.
   *
   * @param {number} t - the time index
   */
  #computeSafeSpots(t) {
    // First, put all locations into the safe Set.
    const safe = new Set();

    for (let i = 0; i < this.#indexLimit; i++) {
      safe.add(i);
    }

    // Now compute blizzard locations and remove them from the safe Set.
    this.#blizzards.forEach(blizzard => {
      safe.delete(blizzard.indexAt(t));
    });

    // Cache the results
    this.#safe[t] = safe;
  }
}

/**
 * Responsible for computing the location of individual blizzards.
 */
class Blizzard {
  #indexBase;
  #posAtT0;
  #multiplier;
  #step;
  #cycle;

  /**
   * Creates a new `Blizzard`.
   *
   * @param {number} rows - the number of rows in the valley interior
   * @param {number} cols - the number of columns in the valley interior
   * @param {number} r - the starting row for the blizzard
   * @param {number} c - the starting column for the blizzard
   * @param {Array<number>} dir
   */
  constructor(rows, cols, r, c, dir) {
    const index0 = r * cols + c;

    if (dir[0] === 0) { // horizontal
      this.#posAtT0 = index0 % cols;
      this.#indexBase = index0 - this.#posAtT0;
      this.#multiplier = 1;
      this.#step = dir[1] > 0 ? 1 : cols - 1;
      this.#cycle = cols;
    } else { // vertical
      this.#posAtT0 = Math.floor(index0 / cols);
      this.#indexBase = index0 % cols;
      this.#multiplier = cols;
      this.#step = dir[0] > 0 ? 1 : rows - 1;
      this.#cycle = rows;
    }
  }

  /**
   * Determines the location of this `Blizzard` at the named time index.
   *
   * @param {number} t - the time index
   * @returns {number} - the valley location index
   */
  indexAt(t) {
    const pos = (this.#posAtT0 + (this.#step * t)) % this.#cycle;
    return pos * this.#multiplier + this.#indexBase;
  }
}