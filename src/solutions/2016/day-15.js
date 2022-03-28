const { match } = require('../util');
const { lcm } = require('../math2');

const DISC_REGEXP = /Disc #(?<number>\d+) has (?<positions>\d+) positions; at time=0, it is at position (?<start>\d+)./g;

/**
 * # [Advent of Code 2016 Day 15](https://adventofcode.com/2016/day/15)
 *
 * For each disc, the position of the slot when the ball reaches it is:
 *
 * ```txt
 * (dropTime + number + startPosition) % numberOfPositions
 * ```
 *
 * We need to find the value of `dropTime` where the slot position for each
 * disc when the ball reaches it is `0`. Brute force testing of drop times will
 * take a long time, but we don't have to do that.
 *
 * For each disc, the slot lines up at the correct position only every
 * `numberOfPositions` ticks. The cycle length where any two discs line up
 * correctly is the least common multiple of their `numberOfPositions` values.
 * So the solution can be found as follows:
 *
 * 1. Set variables `dropTime` to `0` and `period` to `1`.
 * 2. For each disc:
 *    1. Set the variable `slotPos` to the slot's position at the time the ball
 *       reaches the disc if dropped at `dropTime` (as computed by the formula
 *       above).
 *    2. If `slotPos` is not `0`, add `period` to `dropTime` and go back to the
 *       previous step.
 *    3. Set `period` to the least common multiple of itself and the number of
 *       positions the disc has.
 * 3. Return `dropTime`.
 *
 * For part two, you simply have to add another disc and run the same procedure
 * again.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const discs = parse(input);
  const part1 = computeDropTime(discs);
  discs.push({
    number: discs.length + 1,
    positions: 11,
    start: 0,
  });
  const part2 = computeDropTime(discs);
  return [ part1, part2 ];
};

/**
 * Computes the correct time to drop the ball for the given discs.
 *
 * @param {Array} discs - the discs in the machine
 * @returns {number} - the correct time index
 */
const computeDropTime = discs => {
  let dropTime = 0;
  let period = 1;
  discs.forEach(disc => {
    let slotPos;

    do {
      slotPos = (dropTime + disc.number + disc.start) % disc.positions;

      if (slotPos === 0) {
        break;
      } else  {
        dropTime += period;
      }
    } while (true);

    period = lcm(period, disc.positions);
  });
  return dropTime;
};

/**
 * Parses the puzzle input into an array of disc objects:
 *
 * - `number` (number): the disc number
 * - `positions` (number): the number of positions the disc has
 * - `start` (number): the starting position of the disc
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed discs
 */
const parse = input => match(input, DISC_REGEXP, {
  number: Number,
  positions: Number,
  start: Number,
});
