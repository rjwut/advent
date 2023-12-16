const SimpleGrid = require('../simple-grid');

/**
 * Each direction object has a `delta` property that gives the change in row and column coordinates
 * for that direction, and a `getEdgeTiles` method that returns the coordinates of the tiles on the
 * edge of the contraption from which you would start if you were to follow that direction.
 */
const Direction = {
  UP: {
    delta: { r: -1, c: 0 },
    getEdgeTiles: contraption => {
      const r = contraption.rows - 1;
      return new Array(contraption.cols).fill(0)
        .map((_, c) => ({ r, c }));
    },
  },
  RIGHT: {
    delta: { r: 0, c: 1 },
    getEdgeTiles: contraption => new Array(contraption.rows).fill(0)
      .map((_, r) => ({ r, c: 0 })),
  },
  DOWN: {
    delta: { r: 1, c: 0 },
    getEdgeTiles: contraption => new Array(contraption.cols).fill(0)
      .map((_, c) => ({ r: 0, c })),
  },
  LEFT: {
    delta: { r: 0, c: -1 },
    getEdgeTiles: contraption => {
      const c = contraption.cols - 1;
      return new Array(contraption.rows).fill(0)
        .map((_, r) => ({ r, c }));
    },
  },
};

/**
 * How to respond to mirrors and splitters in each direction.
 */
Direction.UP.symbols = {
  '.':  [ Direction.UP ],
  '/':  [ Direction.RIGHT ],
  '\\': [ Direction.LEFT ],
  '|':  [ Direction.UP ],
  '-':  [ Direction.LEFT, Direction.RIGHT ],
};
Direction.RIGHT.symbols = {
  '.':  [ Direction.RIGHT ],
  '/':  [ Direction.UP ],
  '\\': [ Direction.DOWN ],
  '|':  [ Direction.UP, Direction.DOWN ],
  '-':  [ Direction.RIGHT ],
};
Direction.DOWN.symbols = {
  '.':  [ Direction.DOWN ],
  '/':  [ Direction.LEFT ],
  '\\': [ Direction.RIGHT ],
  '|':  [ Direction.DOWN ],
  '-':  [ Direction.LEFT, Direction.RIGHT ],
};
Direction.LEFT.symbols = {
  '.':  [ Direction.LEFT ],
  '/':  [ Direction.DOWN ],
  '\\': [ Direction.UP ],
  '|':  [ Direction.UP, Direction.DOWN ],
  '-':  [ Direction.LEFT ],
};

/**
 * # [Advent of Code 2023 Day 16](https://adventofcode.com/2023/day/16)
 *
 * Two things that can trip you up on this one:
 *
 * A tile is only energized once, no matter how many times a light beam passes through it. I put
 * the coordinates of energized tiles into a `Set` so that I don't duplicate them.
 *
 * Since light beams can go into infinite loops, I also created a `Set` that keeps track of every
 * unique combination of position and direction that I've seen. If I ever see the same one again, I
 * know that light beam has gone into a loop and I can stop following it.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const contraption = new Contraption(input);
  return [
    contraption.energize({ r: 0, c: 0 }, Direction.RIGHT),
    contraption.idealEnergize(),
  ];
};

/**
 * Holds all the tiles and runs light beam simulations.
 */
class Contraption extends SimpleGrid {
  /**
   * Parse the puzzle input.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    super({ data: input });
  }

  /**
   * Calculates how many tiles would be energized by a light beam entering the `Contraption` at the
   * given position, and travelling in the indicated direction.
   *
   * @param {Object} pos - the start position
   * @param {Object} dir - the start direction
   * @returns {number} - the number of energized tiles
   */
  energize(pos, dir) {
    const stack = [ { pos, dir } ];
    const energized = new Set();
    const seen = new Set();

    do {
      const { pos, dir } = stack.pop();
      const { r, c } = pos;
      const tile = this.get(r, c);
      energized.add(`${r},${c}`); // don't count tiles as energized more than once
      dir.symbols[tile].forEach(nextDir => {
        const nextPos = { r: r + nextDir.delta.r, c: c + nextDir.delta.c };

        if (this.inBounds(nextPos.r, nextPos.c)) { // don't follow light beams off the edge
          const key = `${nextPos.r},${nextPos.c},${nextDir.delta.r},${nextDir.delta.c}`;

          if (seen.has(key)) {
            return; // don't follow light beams into infinite loops
          }

          seen.add(key);
          stack.push({ pos: nextPos, dir: nextDir });
        }
      });
    } while (stack.length);

    return energized.size;
  }

  /**
   * Determine the start position and direction for the light beam that will energize the most
   * tiles, then calculate how many tiles would be energized.
   *
   * @returns {number} - the number of energized tiles for the ideal light beam
   */
  idealEnergize() {
    return Object.values(Direction)
      .flatMap(
        dir => dir.getEdgeTiles(this).map(pos => this.energize(pos, dir))
      )
      .reduce(
        (max, count) => Math.max(max, count),
        0
      );
  }
}
