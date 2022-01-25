const BooleanInfiniteGrid = require('../boolean-infinite-grid');
const ocr = require('../ocr');
const { match } = require('../util');

const INPUT_REGEXP = /^position=<\s?(?<x>-?\d+),\s+(?<y>-?\d+)> velocity=<\s?(?<dx>-?\d+),\s+(?<dy>-?\d+)>$/gm;

/**
 * # [Advent of Code 2018 Day 10](https://adventofcode.com/2018/day/10)
 *
 * The key to solving this puzzle is to recognize how to tell when the lights
 * have reached alignment to form the message. If you look at the sample data
 * from the puzzle, you may notice that the moment when the message appears is
 * also the moment where the lights are the closest to each other. In other
 * words, the vertical and horizontal ranges where the lights are present
 * reaches a minimum at that moment. So we run the simulation of the movement
 * of the lights, and check the vertical range of the lights at each step. That
 * range will continue to get smaller until it hits some minimum value, then on
 * the next step it will be larger again. When that happens, the message was
 * visible on the previous step.
 *
 * Once we find the moment when the message appears, we just render the points
 * into a grid, convert it to a string, and run it through my `ocr` module. My
 * `InfiniteGrid` class is helpful here because it won't matter where the
 * points are in the plane, and it automatically handles computing the bounds
 * of the image so that our render will be cropped right around the message.
 *
 * The minimum Y range for the sample data is 8, but in the real data it's 10,
 * which means that the sample data and the real data use different fonts. The
 * eight-pixel font used by the "HI" example isn't used by any other Advent of
 * Code puzzles so far, so I just made a separate font that only has the
 * letters `H` and `I` in it so the test would pass.
 *
 * Part two is simple; just add a time counter that gets incremented with each
 * step of the simulation.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async input => {
  const startPoints = match(
    input,
    INPUT_REGEXP,
    { x: Number, y: Number, dx: Number, dy: Number }
  );
  const { points, time } = simulate(startPoints);
  const message = await ocr(render(points));
  return [ message, time ];
};

/**
 * Simulate the movement of the lights until they reach their minimum range on
 * the Y axis, which is when the message appears. The returned object has two
 * properties:
 *
 * - `points` (Array): The positions of the points at the time they formed the
 * message
 * - `time` (number): How many seconds elapsed before the message appeared
 *
 * @param {Array} points - the starting points for the lights
 * @returns {Object} - the result object described above
 */
const simulate = points => {
  let height = Infinity;
  let time = 0;

  do {
    const range = { min: Infinity, max: -Infinity };
    const nextPoints = points.map(point => {
      const nextPoint = {
        x: point.x + point.dx,
        y: point.y + point.dy,
        dx: point.dx,
        dy: point.dy,
      };
      range.min = Math.min(range.min, nextPoint.y);
      range.max = Math.max(range.max, nextPoint.y);
      return nextPoint;
    });

    const nextHeight = range.max - range.min;

    if (nextHeight > height) {
      break;
    }

    time++;
    height = nextHeight;
    points = nextPoints;
  } while (true);

  return { points, time };
};

/**
 * Converts the points into a rendinering of the glyphs that form the message.
 *
 * @param {Array} points - the points to render 
 * @returns {string} - the message rendering
 */
const render = points => {
  const grid = points.reduce((grid, point) => {
    grid.put([ point.y, point.x ], true);
    return grid;
  }, new BooleanInfiniteGrid());
  const lines = [];
  let line;
  let lastY;
  grid.forEach(([ y ], value) => {
    if (y !== lastY) {
      if (line) {
        lines.push(line.join(''));
      }

      line = [];
      lastY = y;
    }

    line.push(value ? '#' : '.');
  });
  lines.push(line.join(''));
  return lines.join('\n');
};
