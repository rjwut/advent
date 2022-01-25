const CELLS_REGEXP = /[#.]/g;

// Coordinate deltas for computing neighbors for part 1
const NEIGHBORS_PART_1 = [
  [ -1,  0 ], // north
  [  0, -1 ], // west
  [  0,  1 ], // east
  [  1,  0 ], // south
];

// Adjacency lists for computing neighbors for part 2
const NEIGHBORS_PART_2 = {
  A: [
    { square: 'H', depth: -1 },
    { square: 'L', depth: -1 },
    { square: 'B', depth:  0 },
    { square: 'F', depth:  0 },
  ],
  B: [
    { square: 'H', depth: -1 },
    { square: 'A', depth:  0 },
    { square: 'C', depth:  0 },
    { square: 'G', depth:  0 }
  ],
  C: [
    { square: 'H', depth: -1 },
    { square: 'B', depth:  0 },
    { square: 'D', depth:  0 },
    { square: 'H', depth:  0 },
  ],
  D: [
    { square: 'H', depth: -1 },
    { square: 'C', depth:  0 },
    { square: 'E', depth:  0 },
    { square: 'I', depth:  0 },
  ],
  E: [
    { square: 'H', depth: -1 },
    { square: 'D', depth:  0 },
    { square: 'N', depth: -1 },
    { square: 'J', depth:  0 },
  ],
  F: [
    { square: 'A', depth:  0 },
    { square: 'L', depth: -1 },
    { square: 'G', depth:  0 },
    { square: 'K', depth:  0 },
  ],
  G: [
    { square: 'B', depth:  0 },
    { square: 'F', depth:  0 },
    { square: 'H', depth:  0 },
    { square: 'L', depth:  0 },
  ],
  H: [
    { square: 'C', depth:  0 },
    { square: 'G', depth:  0 },
    { square: 'I', depth:  0 },
    { square: 'A', depth:  1 },
    { square: 'B', depth:  1 },
    { square: 'C', depth:  1 },
    { square: 'D', depth:  1 },
    { square: 'E', depth:  1 },
  ],
  I: [
    { square: 'D', depth:  0 },
    { square: 'H', depth:  0 },
    { square: 'J', depth:  0 },
    { square: 'N', depth:  0 },
  ],
  J: [
    { square: 'E', depth:  0 },
    { square: 'I', depth:  0 },
    { square: 'N', depth: -1 },
    { square: 'O', depth:  0 },
  ],
  K: [
    { square: 'F', depth:  0 },
    { square: 'L', depth: -1 },
    { square: 'L', depth:  0 },
    { square: 'P', depth:  0 },
  ],
  L: [
    { square: 'G', depth:  0 },
    { square: 'K', depth:  0 },
    { square: 'A', depth:  1 },
    { square: 'F', depth:  1 },
    { square: 'K', depth:  1 },
    { square: 'P', depth:  1 },
    { square: 'U', depth:  1 },
    { square: 'Q', depth:  0 },
  ],
  N: [
    { square: 'I', depth:  0 },
    { square: 'E', depth:  1 },
    { square: 'J', depth:  1 },
    { square: 'O', depth:  1 },
    { square: 'T', depth:  1 },
    { square: 'Y', depth:  1 },
    { square: 'O', depth:  0 },
    { square: 'S', depth:  0 },
  ],
  O: [
    { square: 'J', depth:  0 },
    { square: 'N', depth:  0 },
    { square: 'N', depth: -1 },
    { square: 'T', depth:  0 },
  ],
  P: [
    { square: 'K', depth:  0 },
    { square: 'L', depth: -1 },
    { square: 'Q', depth:  0 },
    { square: 'U', depth:  0 },
  ],
  Q: [
    { square: 'L', depth:  0 },
    { square: 'P', depth:  0 },
    { square: 'R', depth:  0 },
    { square: 'V', depth:  0 },
  ],
  R: [
    { square: 'U', depth:  1 },
    { square: 'V', depth:  1 },
    { square: 'W', depth:  1 },
    { square: 'X', depth:  1 },
    { square: 'Y', depth:  1 },
    { square: 'Q', depth:  0 },
    { square: 'S', depth:  0 },
    { square: 'W', depth:  0 },
  ],
  S: [
    { square: 'N', depth:  0 },
    { square: 'R', depth:  0 },
    { square: 'T', depth:  0 },
    { square: 'X', depth:  0 },
  ],
  T: [
    { square: 'O', depth:  0 },
    { square: 'S', depth:  0 },
    { square: 'N', depth: -1 },
    { square: 'Y', depth:  0 },
  ],
  U: [
    { square: 'P', depth:  0 },
    { square: 'L', depth: -1 },
    { square: 'V', depth:  0 },
    { square: 'R', depth: -1 },
  ],
  V: [
    { square: 'Q', depth:  0 },
    { square: 'U', depth:  0 },
    { square: 'W', depth:  0 },
    { square: 'R', depth: -1 },
  ],
  W: [
    { square: 'R', depth:  0 },
    { square: 'V', depth:  0 },
    { square: 'X', depth:  0 },
    { square: 'R', depth: -1 },
  ],
  X: [
    { square: 'S', depth:  0 },
    { square: 'W', depth:  0 },
    { square: 'Y', depth:  0 },
    { square: 'R', depth: -1 },
  ],
  Y: [
    { square: 'T', depth:  0 },
    { square: 'X', depth:  0 },
    { square: 'N', depth: -1 },
    { square: 'R', depth: -1 },
  ],
};
const PART_2_MINUTES = 200;

/**
 * # [Advent of Code 2019 Day 24](https://adventofcode.com/2019/day/24)
 *
 * Unlike the usual appearances of
 * [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
 * in Advent of Code, the grid is finite, at least in part one. Part two's grid
 * becomes infinite, but recursively, as in the day 20 puzzle, instead of the
 * usual way.
 *
 * Part one's implementation is straightforward. The two main things to note
 * are:
 *
 * - Don't read and write to the same grid. Read from the current grid and
 *   write to a new grid. Then, once the pass is done, swap the new grid in
 *   place of the old one.
 * - No two grid states will have the same biodiversity rating, so the rating
 *   itself can be used as a hash to determine if a state has already been
 *   encountered. Just stick them in a `Set` and stop when you find one that's
 *   already there.
 *
 * Since part two's space is infinite, I use a `Set` instead of an array to
 * keep track of the bugs. Each cell is represented by a string key in the form
 * `<depth><square>`, where `depth` is an integer and `square` is a letter
 * identifying the square at that depth (`A` through `Y`, skipping `M` for the
 * center). If a cell's key is present in the `Set`, that cell contains a bug.
 *
 * The `NEIGHBORS_PART_2` object is used to look up the neighbors for
 * any cell. Each entry is keyed under the square's letter, and is an array of
 * objects representing each neighbor. The neighbor is represented by an object
 * that gives the square letter and relative depth of the neighbor (`0` for a
 * square at the same depth, `1` for one level down, and `-1` for one level
 * up). For example, to find the neighbors for cell `-1F`, I look up `F` in
 * `NEIGHBORS_PART_2`, which gives the following array:
 *
 * ```js
 * [
 *   { square: 'A', depth:  0 },
 *   { square: 'L', depth: -1 },
 *   { square: 'G', depth:  0 },
 *   { square: 'K', depth:  0 },
 * ]
 * ```
 *
 * This means that the neighbors of `-1F` are `-1A`, `-2L`, `-1G`, and `-1K`.
 *
 * Any time a bug is located at the edges of the grid at the lowest (most
 * negative) depth, the next step will have one or more bugs at the next level
 * down. Likewise, when the grid at the highest depth has a bug adjacent to the
 * center, the next step will have five or more bugs at the next level up. So
 * we need to track our minimum and maximum depths. Any time we place a bug
 * that is outside the current depth range, we extend the range to include it.
 * When we iterate cells to find bug locations for the next step, we must check
 * the grids one level outside of our range in each direction. For each of
 * those levels, we iterate each square in the grid. So for our 5x5 grid, if
 * our current depth range were `[-1, 1]`, we would iterate over 125 cells.
 *
 * Now that we can address, store, and iterate this recursive space, we can
 * run the simulation for 200 steps. The number of bugs in the space is simply
 * the number of entries in our `Set`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = (input, minutes) => [ part1, part2 ].map(fn => fn(input, minutes));

/**
 * Computes the biodiversity rating for the first grid that repeats, using the
 * part one finite grid.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the biodiversity rating
 */
const part1 = input => {
  const eris = parse1(input);
  const seen = new Set();

  do {
    const biodiversity = eris.computeBiodiversity();

    if (seen.has(biodiversity)) {
      return biodiversity;
    }

    seen.add(biodiversity);
    eris.step();
  } while (true);
};

/**
 * Computes the number of bugs after 200 minutes, using the part two infinitely
 * recursive grid.
 *
 * @param {string} input - the puzzle input
 * @param {number} [minutes=200] - the number of minutes to run the simulation
 * @returns {number} - the number of bugs after the given number of minutes
 */
const part2 = (input, minutes = PART_2_MINUTES) => {
  const eris = parse2(input);

  for (let i = 0; i < minutes; i++) {
    eris.step();
  }

  return eris.count();
}

/**
 * Parses the input and produces an API to control the simulation according to
 * part one's rules. The API has two methods:
 *
 * - `step()`: Advances the simulation one step
 * - `computeBiodiversity()`: Computes the biodiversity rating for the current
 *   state
 *
 * @param {string} input - the puzzle input 
 * @returns {Object} - the simulation API
 */
const parse1 = input => {
  let cells = [ ...input.matchAll(CELLS_REGEXP) ]
    .map(match => match[0] === '#' ? 1 : 0);
  const size = Math.sqrt(cells.length);
  let next = new Array(cells.length);

  /**
   * Returns whether the given coordinates are in range.
   *
   * @param {number} r - the row coordinate
   * @param {nunber} c - the column coordinate
   * @returns {boolean} - whether the coordinates are in range
   */
  const inRange = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

  const api = {
    /**
     * Determines whether there is a bug at the given coordinates.
     *
     * @param {number} r - the row coordinate
     * @param {number} c - the column coordinate
     * @returns {number} - `1` if a bug is there, `0` if there's no bug or the
     * coordinates are out of range
     */
    get: (r, c) => inRange(r, c) ? cells[r * size + c] : 0,

    /**
     * Places a bug or empty space at the given coordinates for the next step.
     *
     * @param {number} r - the row coordinate
     * @param {number} c - the column coordinate
     * @param {number} v - `1` for a bug, `0` for no bug
     */
    set: (r, c, v) => next[r * size + c] = v,

    /**
     * Returns the number of bugs adjacent to the given coordinates.
     *
     * @param {number} r - the row coordinate
     * @param {number} c - the column coordinate
     * @returns {number} - the number of bugs
     */
    countNeighbors: (r, c) => NEIGHBORS_PART_1.reduce((sum, [ dr, dc ]) => {
      return sum + api.get(r + dr, c + dc);
    }, 0),

    /**
     * Makes the next step array the current one, and makes a new array for the
     * next step.
     */
    finalize: () => {
      cells = next;
      next = new Array(cells.length);
    },

    /**
     * Computes the biodiversity rating for the current grid.
     *
     * @returns {number} - the biodiversity rating
     */
    computeBiodiversity: () => cells.reduce((sum, v, i) => {
      return sum + (v ? Math.pow(2, i) : 0);
    }, 0),
  };
  return {
    /**
     * Advances the simulation one step.
     */
    step: () => {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const state = api.get(r, c);
          const neighbors = api.countNeighbors(r, c);

          if (state) {
            api.set(r, c, neighbors === 1 ? 1 : 0);
          } else {
            api.set(r, c, neighbors === 1 || neighbors === 2 ? 1 : 0);
          }
        }
      }

      api.finalize();
    },

    /**
     * Computes the biodiversity rating for the current grid.
     *
     * @returns {number} - the biodiversity rating
     */
    computeBiodiversity: () => api.computeBiodiversity(),
  };
};

/**
 * Parses the input and produces an API to control the simulation according to
 * part two's rules. The API has two methods:
 *
 * - `step()`: Advances the simulation one step
 * - `count()`: Computes the number of bugs in the current state
 *
 * @param {string} input - the puzzle input 
 * @returns {Object} - the simulation API
 */
const parse2 = input => {
  let cells = [ ...input.matchAll(CELLS_REGEXP) ]
    .map(match => match[0] === '#')
    .reduce((set, v, i) => {
      if (v) {
        set.add(`0${String.fromCharCode(i + 65)}`)
      }

      return set;
    }, new Set());
  const depthRange = { min: 0, max: 0 };
  let next = new Set();
  const api = {
    /**
     * Returns whether a bug is at the given location.
     *
     * @param {string} square - the letter for the square
     * @param {number} depth - the depth offset from the starting level
     * @returns {number} - `1` if a bug is there, `0` if there's no bug
     */
    get: (square, depth) => cells.has(`${depth}${square}`) ? 1 : 0,

    /**
     * Places a bug at the given location for the next step.
     *
     * @param {string} square - the letter for the square
     * @param {number} depth - the depth offset from the starting level
     */
    set: (square, depth) => {
      next.add(`${depth}${square}`);
      depthRange.min = Math.min(depthRange.min, depth);
      depthRange.max = Math.max(depthRange.max, depth);
    },

    /**
     * Returns the number of bugs adjacent to the given location.
     *
     * @param {string} square - the letter for the square
     * @param {number} depth - the depth offset from the starting level
     * @returns {number} - the number of adjacent bugs
     */
    countNeighbors: (square, depth) => {
      return NEIGHBORS_PART_2[square].reduce((sum, neighborDef) => {
        return sum + api.get(neighborDef.square, depth + neighborDef.depth);
      }, 0);
    },

    /**
     * Makes the next step `Set` the current one, and makes a new `Set` for the
     * next step.
     */
    finalize: () => {
      cells = next;
      next = new Set();
    },

    /**
     * Returns the number of bugs.
     *
     * @returns {number} - the number of bugs
     */
    count: () => cells.size,
  };
  return {
    /**
     * Advances the simulation one step.
     */
    step: () => {
      let depthMin = depthRange.min - 1;
      let depthMax = depthRange.max + 1;

      for (let depth = depthMin; depth <= depthMax; depth++) {
        for (let i = 0; i < 25; i++) {
          if (i === 12) {
            continue; // skip middle square
          }

          const square = String.fromCharCode(i + 65);
          const neighbors = api.countNeighbors(square, depth);
          const state = api.get(square, depth);
          let newState = state ? neighbors === 1 : neighbors === 1 || neighbors === 2;

          if (newState) {
            api.set(square, depth);
          }
        }
      }

      api.finalize();
    },

    /**
     * Returns the number of bugs.
     *
     * @returns {number} - the number of bugs
     */
    count: () => api.count(),

    /**
     * Renders a string representation of the current state.
     *
     * @returns {string} - the state rendered as a string
     */
    toString: () => {
      const lines = [];
      let line;

      for (let r = 0; r < 5; r++) {
        line = [];

        for (let d = depthRange.min; d <= depthRange.max; d++) {
          if (d !== depthRange.min) {
            line.push(' ');
          }

          for (let c = 0; c < 5; c++) {
            const square = String.fromCharCode(r * 5 + c + 65);
            line.push(square === 'M' ? '?' : api.get(square, d) ? '#' : '.');
          }
        }

        lines.push(line.join(''));
        line = [];
      }

      for (let d = depthRange.min; d <= depthRange.max; d++) {
        let label = d.toString();
        label = ' '.repeat(5 - label.length) + label;
        line.push(label);
      }

      lines.push(line.join(' '));
      return lines.join('\n');
    },
  };
};

solver.api1 = parse1;
solver.api2 = parse2;
module.exports = solver;
