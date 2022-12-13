const IntcodeVm = require('./intcode');

/**
 * # [Advent of Code 2019 Day 19](https://adventofcode.com/2019/day/19)
 *
 * Part one is super easy: just query the Intcode program for every point
 * within the range `(0, 0)` to `(49, 49)` and add up the output values.
 *
 * Part two is not much harder. The most straightforward way I thought of
 * turned out to work very quickly. Start with the top-left corner at `(0, 0)`.
 * Move the square down until the top-right corner is in the beam. Then move it
 * right until the bottom-left corner is in the beam. This will likely have
 * moved the top-right corner out of the beam, so move the square down more
 * until it's in the beam again. Continue alternating moving the square down
 * and right until both corners are in the beam.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const query = buildQueryFunction(input);
  return [ part1(query), part2(query) ];
};

/**
 * Computes the number of points in the beam in the range `(0, 0)` to
 * `(49, 49)`.
 *
 * @param {Function} query - the function to query the Intcode program about a
 * coordinate
 * @returns {number} - the number of points in the beam
 */
const part1 = query => {
  let count = 0;

  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      count += query(x, y);
    }
  }

  return count;
};

/**
 * Computes the location nearest to the origin where a 100x100 square would be
 * entirely within the beam, then returns `x * 10000 + y` for the upper-left
 * corner of that square.
 *
 * @param {Function} query - the function to query the Intcode program about a
 * coordinate
 * @returns {number} - the answer for part two
 */
const part2 = query => {
  const coords = { x: 0, y: 0 };
  const ok = { x: false, y: false };
  let axis = 'x';

  do {
    const checkPoint = {
      x: coords.x + (axis === 'x' ? 99 : 0),
      y: coords.y + (axis === 'y' ? 99 : 0),
    };
    const inBeam = query(checkPoint.x, checkPoint.y) === 1;
    ok[axis] = inBeam;

    if (inBeam) {
      axis = axis === 'x' ? 'y' : 'x';
    } else {
      coords.x += axis === 'x' ? 0 : 1;
      coords.y += axis === 'y' ? 0 : 1;
      ok.x = false;
      ok.y = false;
    }
  } while (!ok.x || !ok.y);

  return coords.x * 10000 + coords.y;
};

/**
 * Builds a function that will query the Intcode program to find out whether a
 * point is within the beam.
 *
 * @param {string} source - the Intcode program source
 * @returns {Function} - the query function
 */
const buildQueryFunction = source => {
  return (x, y) => {
    const vm = new IntcodeVm();
    vm.load(source);
    vm.enqueueInput(x);
    vm.enqueueInput(y);
    vm.run();
    return vm.dequeueOutput();
  };
};
