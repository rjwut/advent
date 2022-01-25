const { match } = require('../util');
const InfiniteGrid = require('../infinite-grid');

const CLAY_REGEXP = /^(?<fixedAxis>.)=(?<fixedCoord>\d+)?, (?<rangeAxis>.)=(?<range0>\d+)(?:\.\.(?<range1>\d+))?$/gm;
const SPRING_X = 500;

/**
 * # [Advent of Code 2018 Day 17](https://adventofcode.com/2018/day/17)
 *
 * Algorithm:
 *
 * 1. Parse the input into a list of clay vein objects.
 * 2. Render each clay vein on a grid.
 * 3. Create a queue of waterfall locations.
 * 4. Populate the queue with inital waterfall location, with `x` at the
 *    spring's `x` coordinate and `y` at the minimum `y` coordinate.
 * 5. While the queue is not empty (queue processing loop):
 *    1. Take a waterfall location from the queue.
 *    2. Trace downward from the waterfall location, putting `|` in each grid
 *       cell, stopping when you hit the bottom of the grid or just before a
 *       non-empty cell, whichever happens first.
 *    3. If the next cell had a `|` or you reached the bottom of the grid, go
 *       to step 1 in the queue processing loop.
 *    4. From your current position, seek left and right for the end of the
 *       spread (seek loop):
 *       1. Move one cell in the seek direction.
 *       2. If that cell contains a `#`, the spread in that direction is
 *          blocked; exit the seek loop.
 *       3. If the cell directly below the current cell is empty or contains a
 *          `|`, we have found the spread edge in that direction; exit the seek
 *          loop.
 *       4. Go back to step 1 of the seek loop.
 *    5. If the seek in both directions was blocked by clay (`#`), set the fill
 *       character to `~`; otherwise, set it to `|`.
 *    6. Fill all the cells on that row between and including the two spread
 *       ends with the fill character.
 *    7. If the fill character is `~`, subtract `1` from `y` and go back to
 *       step 4 in the queue processing loop.
 *    8. In each seek direction, if the spread was not blocked by clay and the
 *       character below the spread end is not a `|`, enqueue the spread end
 *       location as a new waterfall.
 * 6. Count the numbers of `~` and `|` cells in the grid.
 * 7. The answer to part one is the sum of the both counts, while the answer to
 *    part two is just the `~` count.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = parse(input);
  simulate(grid);
  const counts = count(grid);
  return [ counts['|'] + counts['~'], counts['~'] ];
};

/**
 * Produces an `InfiniteGrid` containing the clay veins described in the input.
 *
 * @param {string} input - the puzzle input
 * @returns {InfiniteGrid} - the grid
 */
const parse = input => {
  const veins = match(input, CLAY_REGEXP, groups => ({
    [groups.fixedAxis]: [
      Number(groups.fixedCoord),
      Number(groups.fixedCoord),
    ],
    [groups.rangeAxis]: [
      Number(groups.range0),
      Number(groups.range1),
    ],
  }));
  const grid = new InfiniteGrid();

  for (const vein of veins) {
    for (let y = vein.y[0]; y <= vein.y[1]; y++) {
      for (let x = vein.x[0]; x <= vein.x[1]; x++) {
        grid.put([ y, x ], '#');
      }
    }
  }

  return grid;
};

/**
 * Runs the complete water flow simulationa and draws the results on the grid.
 *
 * @param {InfiniteGrid} grid - the grid with the rendered clay veins
 */
const simulate = grid => {
  const [ yRange ] = grid.getBounds();
  const queue = [ { x: SPRING_X, y: yRange.min } ];

  /**
   * Processes a single waterfall location:
   *
   * 1. Trace downward until the fall stops or goes of the bottom of the grid.
   * 2. If the fall was stopped and didn't run into existing water, spread left
   *    and right until a new waterfall location is found or you're blocked by
   *    clay.
   * 3. For each end of the spread that did not get blocked by clay, enqueue a
   *    new waterfall location.
   *
   * @param {number} param.x - the X coordinate of the waterfall location
   * @param {number} param.y - the Y coordinate of the waterfall location 
   */
  const step = ({ x, y }) => {
    // Fall until stopped or we hit bottom
    let chr;

    do {
      grid.put([ y++, x ], '|');
      chr = grid.get([ y, x ]);
    } while (chr === undefined && y <= yRange.max);

    if (y > yRange.max || chr === '|') {
      return;
    }

    y--;

    // Spread left and right, filling up until we generate a new fall
    do {
      const leftSeek = seek(x, y, -1);
      const rightSeek = seek(x, y, 1);
      const fillChar = leftSeek.blocked && rightSeek.blocked ? '~' : '|';
      fillRange(y, leftSeek.x, rightSeek.x, fillChar);
  
      if (fillChar === '~') {
        y--;
      } else {
        if (!leftSeek.blocked && leftSeek.below !== '|') {
          queue.push({ x: leftSeek.x, y });
        }

        if (!rightSeek.blocked && rightSeek.below !== '|') {
          queue.push({ x: rightSeek.x, y });
        }

        break;
      }
    } while (true);
  };

  /**
   * Fills a horizontal range of grid cells with the given character.
   *
   * @param {number} y - the Y coordinate of the range
   * @param {number} x0 - the left X coordinate of the range 
   * @param {number} x1 - the right X coordinate of the range
   * @param {string} chr - the character with which to fill the range
   */
  const fillRange = (y, x0, x1, chr) => {
    const coords = [ y, x0 ];

    do {
      grid.put(coords, chr);
      coords[1]++;
    } while (coords[1] <= x1);
  };

  /**
   * Seeks in the indicated horizontal direction from the given coordinates
   * until you reach a clay wall or an edge where a new fall should begin. The
   * returned object has the following parameters:
   *
   * - `blocked` (boolean): Whether the spread was blocked by a clay wall
   * - `x` (number): The X coordinate where the spread stopped
   *
   * @param {number} x - the X coordinate of the location to seek from
   * @param {number} y - the Y coordinate of the location to seek from
   * @param {number} dir - the seek direction, either `-1` or `1`
   * @returns {Object} - the seek result
   */
  const seek = (x, y, dir) => {
    const coords = [ y, x ];
    let chr;

    do {
      coords[1] += dir;

      if (grid.get(coords) === '#') {
        return { blocked: true, x: coords[1] - dir };
      }

      chr = grid.get([ coords[0] + 1, coords[1] ]);
    } while (chr !== undefined && chr !== '|');

    return { blocked: false, x: coords[1], below: chr };
  };


  do {
    step(queue.shift());
  } while (queue.length);
};

/**
 * Returns the numbers of `~` and `|` cells in the grid. The returned object
 * has two properties, `~` and `|`, with the respective counts.
 *
 * @param {InfiniteGrid} grid - the grid 
 * @returns {Object} - the counts
 */
const count = grid => {
  const counts = { '~': 0, '|': 0 };
  grid.forEachSparse((_coords, value) => {
    if (value === '~' || value === '|') {
      counts[value]++;
    }
  });
  return counts;
};
