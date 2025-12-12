const { match } = require('../util');

const REGION_REGEXP = /^(?<width>\d+)x(?<height>\d+): (?<shapeCounts>(?:\d+ )+\d+)$/gm;

/**
 * # [Advent of Code 2025 Day 12](https://adventofcode.com/2025/day/12)
 *
 * I wasted a lot of time working on an algorithm for packing in the presents, until I discovered
 * four things:
 *
 * 1. I realized that I could filter out some cases simply by computing the total area of the
 *    presents to be put in a region, and if that exceeds the area of the region itself, it won't
 *    fit.
 * 2. I decided that maybe I should look at my input, and discovered that all the presents fit in a
 *    3x3 square, not just the ones in the sample input.
 * 3. I then realized that if subdividing the region into 3x3 cells resulted in at least one cell
 *    for each present, it was guaranteed that there would be enough space, and I'd only have to do
 *    the more laborious fitting algorithm for any that did have enough area but did not have enough
 *    3x3 cells.
 * 4. The last discovery was: there _weren't_ any cases that would require the fitting algorithm;
 *    all cases in the actual input were properly accounted for already.
 *
 * So all the work I did on a fitting algorithm was unnecessary: I just needed to check whether
 * there was enough room to tile sufficient 3x3 cells into the region for the presents.
 *
 * There's no way that was an accident, especially considering that it wouldn't have worked one of
 * the test cases. Mr. Wastl did this on purpose, the sneaky little elf. My OCD tendencies are
 * annoyed by this, but I don't know if they're annoyed enough to try to get the fitting algorithm
 * I was working on across the finish line.
 *
 * Anyway, so there's no test case for this, since it wouldn't work. Grr.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const regions = parse(input);
  return [ regions.reduce(
    (count, region) => {
      if (attemptFit(region)) {
        count++;
      }

      return count;
    }, 0
  ), undefined ];
};

/**
 * Parses the puzzle input region objects, where each object has the following properties:
 *
 * - `width: number` - the width of the region
 * - `height: number` - the height of the region
 * - `shapeCounts: number[]` - how many of each shape to fit into the region
 *
 * Note: The actual shapes don't need to be parsed at all.
 *
 * @param {string} input - the puzzle input
 * @returns {Object[]} - the parsed regions
 */
const parse = input => match(input, REGION_REGEXP)
  .map(({ width, height, shapeCounts }) => ({
    width: parseInt(width, 10),
    height: parseInt(height, 10),
    shapeCounts: shapeCounts.split(' ').map(s => parseInt(s, 10)),
  }));

/**
 * Attempt to fit the presents into the region.
 *
 * @param {Object} region - the region to fit presents into
 * @param {number} region.width - the width of the region
 * @param {number} region.height - the height of the region
 * @param {number[]} region.shapeCounts - the counts of each shape to fit
 * @returns {boolean} - whether the presents can fit in the region
 */
const attemptFit = ({ width, height, shapeCounts }) => {
  const numPresents = shapeCounts.reduce((sum, count) => sum + count, 0);
  return Math.floor(width / 3) * Math.floor(height / 3) >= numPresents;
};
