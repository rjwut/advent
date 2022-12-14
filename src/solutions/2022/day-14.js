const { arraysEqual, split } = require('../util');
const InfiniteGrid = require('../infinite-grid');

const SAND_SOURCE = [0, 500];

/**
 * # [Advent of Code 2022 Day 14](https://adventofcode.com/2022/day/14)
 *
 * Parsing was easy: split on newlines, split on arrows, split on commas, convert to number. Due to
 * the need to expand in any direction and keep track of bounds, I used my existing `InfiniteGrid`
 * class as a canvas. I created a function called `drawLine()` that I could give two sets of
 * coordinates and it would draw a line of `#` characters in the grid between them. I used that to
 * draw the lines of stone described by the input onto the canvas.
 *
 * Once I did this, I noted the largest indexed row in the drawing so far, added `1` to it, and
 * called it `rLimit`. This is the row where, if any grain of sand comes to rest there, we've
 * passed the end of part one. Since a grain of sand can move at most one unit to the left or right
 * for each unit moved downward, the widest the pile of sand can be is `height * 2 + 1`. So then I
 * drew another line, two rows below the bottom row in the drawing, and just wide enough to get the
 * sand pile high enough to reach the sand source without spilling over the sides. Now we're ready
 * for the sand.
 *
 * I created a function called `dropSandUntil()` that would repeatedly drop sand until a condition
 * function passed in is fulfilled, then return the number of sand grains dropped. The condition
 * function receives as an argument the coordinates where the last grain of sand came to rest. For
 * part one, the condition was "until a grain of sand comes to rest at `rLimit`." Note that this is
 * actually one grain more than required by the puzzle, so the answer for part one is one less than
 * the value returned by `dropSandUntil()`.
 *
 * For part two, I called `dropSandUntil()` again, this time with the condition being "until a
 * grain of sand comes to rest at the sand source." The return value from this, added to the
 * answer from part one, plus the one grain of sand subtracted earlier, produces the answer to part
 * two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = parse(input);
  const rLimit = grid.getBounds()[0].max + 1;
  drawFloor(grid);
  const atBottom = coords => coords[0] === rLimit;
  const atSource = coords => arraysEqual(coords, SAND_SOURCE);
  const part1 = dropSandUntil(grid, atBottom) - 1;
  const part2 = part1 + dropSandUntil(grid, atSource) + 1;
  return [part1, part2];
};

/**
 * Parse the input and draw the lines of stone it describes onto an `InfiniteGrid`.
 *
 * @param {string} input - the puzzle input
 * @returns {InfiniteGrid} - the resulting grid
 */
const parse = input => {
  const lines = split(input)
    .map(
      line => line.split(' -> ').map(
        coords => {
          const [c, r] = coords.split(',').map(Number);
          return [r, c];
        }
      )
    );
  const grid = new InfiniteGrid();
  lines.forEach(line => {
    let prevCoords;
    line.forEach(coords => {
      if (prevCoords) {
        drawLine(grid, prevCoords, coords);
      }

      prevCoords = coords;
    });
  });
  return grid;
};

/**
 * Draws a line of stone on the grid.
 *
 * @param {InfiniteGrid} grid - the grid
 * @param {Array<number>} from - the coordinates of one end of the line
 * @param {Array<number>} to - the coordinates of the other end of the line
 */
const drawLine = (grid, from, to) => {
  const dr = Math.sign(to[0] - from[0]);
  const dc = Math.sign(to[1] - from[1]);
  const coords = [...from];

  do {
    grid.put(coords, '#');
    coords[0] += dr;
    coords[1] += dc;
  } while (!arraysEqual(coords, to));

  grid.put(to, '#');
};

/**
 * Determines where the floor is located and draws a platform there, just wide enough that the sand
 * pile can reach the sand source without overflowing the edges of the platform.
 *
 * @param {InfiniteGrid} grid - the grid
 */
const drawFloor = grid => {
  const rBounds = grid.getBounds()[0];
  const rBottom = rBounds.max + 2;
  const height = rBottom - SAND_SOURCE[0] + 1;
  const cMin = SAND_SOURCE[1] - height;
  const cMax = SAND_SOURCE[1] + height;
  drawLine(grid, [rBottom, cMin], [rBottom, cMax]);
};

/**
 * Continually emits sand from the sand source until the given condition is fulfilled.
 *
 * @param {InfiniteGrid} grid - the grid
 * @param {Function} stopCondition - the condition at which we should stop dropping sand
 * @returns {number} - the number of sand grains dropped
 */
const dropSandUntil = (grid, stopCondition) => {
  let grains = 0;
  let coords;

  do {
    coords = [...SAND_SOURCE];
    let atRest = false;

    do {
      const [r, c] = coords;
      const rNext = r + 1;
      let cNext;

      if (grid.get([rNext, c]) === undefined) {
        cNext = c;
      } else if (grid.get([rNext, c - 1]) === undefined) {
        cNext = c - 1;
      } else if (grid.get([rNext, c + 1]) === undefined) {
        cNext = c + 1;
      } else {
        grid.put(coords, 'o');
        atRest = true;
        break;
      }

      coords[0] = rNext;
      coords[1] = cNext;
    } while (!atRest);

    grains++;
  } while (!stopCondition(coords));

  return grains;
};
