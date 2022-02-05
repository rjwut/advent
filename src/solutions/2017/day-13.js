const { match } = require('../util');

const LINE_REGEXP = /^(?<depth>\d+): (?<range>\d+)$/gm;

/**
 * # [Advent of Code 2017 Day 13](https://adventofcode.com/2017/day/13)
 *
 * We need to know first of all the cycle time for each scanner (how long it
 * takes to do a complete cycle back and forth and return to the top). It will
 * take `range - 1` ps to get to the bottom, and the same amount of time to get
 * back to the top, so the cycle time is `(range - 1) * 2`. I go ahead and
 * compute this value on parse, naming it `cycle`.
 *
 * We are only caught if we enter the scanner's range at the time that the
 * scanner is currently at the top, so the formula to compute whether we get
 * caught by a scanner is:
 *
 * ```txt
 * caught = (depth + delay) % cycle === 0
 * ```
 *
 * For part one, we just filter the scanners by those which catch us when
 * `delay` is `0`, then multiply the `depth` and `range` of each of those
 * scanners and add the results together.
 *
 * For part two, we iterate `delay` starting at `1`, then check the scanners to
 * see if we've been caught. If not, we return that delay. I knew that my
 * approach was more efficient than actually performing a direct simulation of
 * the scanner positions, but I had thought that it was still too "brute force"
 * to be fast, but the answer came back in less than a second on my machine.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const scanners = match(input, LINE_REGEXP, matchObj => ({
    depth: Number(matchObj.depth),
    range: Number(matchObj.range),
    cycle: (Number(matchObj.range) - 1) * 2,
  }));
  return [ part1, part2 ].map(fn => fn(scanners));
};

/**
 * Filter out the scanners that don't catch us when `delay` is `0`, then
 * multiply together the `depth` and `range` of each scanner and sum the
 * products.
 *
 * @param {Array} scanners - the list of scanners
 * @returns {number} - the answer to part one
 */
const part1 = scanners => scanners.filter(({ depth, cycle }) => depth % cycle === 0)
  .reduce((sum, { depth, range }) => sum + depth * range, 0);

/**
 * Determine the smallest delay that allows us to pass all scanners without
 * getting caught.
 *
 * @param {Array} scanners - the list of scanners
 * @returns {number} - the answer to part two
 */
const part2 = scanners => {
  let delay = 0;

  do {
    delay++;
    const misses = ({ depth, cycle }) => (depth + delay) % cycle;

    if (scanners.every(misses)) {
      return delay;
    }
  } while (true);
};
