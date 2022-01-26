const InfiniteGrid = require('../infinite-grid');

const DIRECTIONS = [
  [ -1,  0 ], // up
  [  0, -1 ], // left
  [  1,  0 ], // down
  [  0,  1 ], // right
];

/**
 * # [Advent of Code 2017 Day 3](https://adventofcode.com/2017/day/3)
 *
 * There's pretty much nothing in common between the two parts of the puzzle in
 * terms of implementation besides input parsing. See the documentation for
 * `part1()` and `part2()` for the details.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - which part of the puzzle to solve
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  input = parseInt(input.trim(), 10);
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](input);
  }

  return parts.map(fn => fn(input));
};

/**
 * Think of the spiral as being composed of a series of square concentric
 * rings. Ring `0` is just the `1` in the center. Ring `1` has the values `2`
 * through `9`, ring `3` has `10` through `25`, etc.
 *
 * The answer to the first part of the puzzle is a Manhattan distance. This can
 * be represented as two straight lines, one in the `X` direction and one in
 * the `Y` direction, connecting the target square to the origin. The longer of
 * the two lines will always have a length equal to the index of the ring that
 * `input` falls on. Let's call this value `dLong`, and the other value
 * `dShort`. So our answer for this part of the puzzle is `dLong + dShort`.
 *
 * The lower-right number of each ring is the highest value in that ring. These
 * numbers as the ring index increases forms the sequence `1`, `9`, `25`,
 * `49`,...: the squares of odd numbers. For the ring that `index` falls on,
 * let's call the square root of this number `rRoot`. The value `rRoot` can be
 * calculated as follows:
 *
 * ```js
 * let rRoot = Math.ceil(Math.sqrt(input));
 * rRoot += rRoot % 2 === 0 ? 1 : 0;
 * ```
 *
 * Subtract `1` and divide by `2` to get `dLong`. That's half of our Manhattan
 * distance. Knowing this allows us to shortcut most of the work we'd have to
 * do in a brute force solution, since now we only have to iterate the last
 * ring.
 *
 * We're going to iterate starting with the smallest value in the ring until we
 * get to `input`. Let's call our iterator variable `n`. The smallest value on
 * the ring is one greater than the largest value on the previous ring, so we
 * can compute it with:
 *
 * ```js
 * let n = (rRoot - 2) ** 2 + 1;
 * ```
 *
 * As we iterate, we're going to keep track of what `dShort` would be if
 * `input` were equal to `n`. When we reach `input`, `dShort` will be the
 * desired value. As we iterate around the ring, the value of `dShort` will
 * decrease as it gets closer to the middle of that side of the ring, where it
 * equals `0`, then increase as it approaches a corner, until it equals
 * `dLong`, then repeat the pattern all the way around the ring. The starting
 * value for `dShort` will be `dLong - 1`. We'll keep track of the direction
 * that `dShort` is heading with a variable called `dir`, which will start at
 * `-1`. For each value we iterate on the ring, we increment `n` by `1` and
 * `dShort` by `dir`. If `dShort` equals `0` or `dLong`, we negate `dir` so
 * that `dShort` starts going in the opposite direction. We continue this until
 * `n` equals `input`, at which point `dShort` has the correct value.
 *
 * Now we just add `dLong` and `dShort` to get the answer.
 *
 * @param {number} input - the puzzle input
 * @returns {number} - the answer for part one
 */
const part1 = input => {
  if (input === 1) {
    return 0;
  }

  // Find the index of the ring where input falls.
  let rRoot = Math.ceil(Math.sqrt(input));
  rRoot += rRoot % 2 === 0 ? 1 : 0;
  const dLong = (rRoot - 1) / 2;

  // Iterate the ring until we get to input, and determine the value of dShort
  // at that location.
  let n = (rRoot - 2) ** 2 + 1;
  let dShort = dLong - 1;
  let dir = -1;

  while (n < input) {
    n++;
    dShort += dir;

    if (dShort === 0 || dShort === dLong) {
      dir = -dir;
    }
  }

  return dLong + dShort;
};

/**
 * The spiral is broken into "legs" of increasing length. Specifically, the
 * first and second legs' lengths are `1`, the third and fourth are `2`, the
 * fifth and sixth are `3`, etc. The leg length stays the same after a
 * horizontal leg and increases after a vertical leg. After each leg is a
 * left turn. We'll keep track of the distance we've travelled on the current
 * leg as `steps` and the length of the leg as `maxSteps`.
 *
 * Our coordinates will be represented as arrays with two elements. Directions
 * will be represented as deltas for these coordinates. For example,
 * `[ -1, 0 ]` means "one row up". We'll keep the four directions in an array
 * such that increasing the index in the array changes our delta to represent
 * a left turn. Just before each turn, we'll check the column delta value of
 * our current direction: if it's `0`, we're moving vertically. If so, we'll
 * increment `maxSteps`.
 *
 * Computing the sum to put in each square is made easy by making use of my
 * `InfiniteGrid` class's `forEachNear()` method, which by default will iterate
 * each square adjacent to the one specified by the given coordinates. We just
 * sum up all the non-`undefined` values provided and put that value in that
 * grid cell. We keep going in this way until the sum equals or exceeds
 * `input` at which point the value of `sum` is our answer.
 *
 * @param {number} input - the puzzle input
 * @returns {number} - the answer to part two
 */
const part2 = input => {
  const grid = new InfiniteGrid();
  grid.put([ 0, 0 ], 1);
  let coords = [ 0, 1 ];
  let direction = 0;
  let steps = 0;
  let maxSteps = 1;
  let sum;
  let delta = DIRECTIONS[direction];

  do {
    sum = 0;
    grid.forEachNear(coords, (_coords, value) => {
      sum += value ?? 0;
    });
    grid.put(coords, sum);
    coords = coords.map((coord, i) => coord + delta[i]);

    if (++steps === maxSteps) {
      if (delta[1] === 0) {
        maxSteps++;
      }

      steps = 0;
      direction = (direction + 1) % 4;
      delta = DIRECTIONS[direction]
    }
  } while (sum <= input);

  return sum;
};
