const { split } = require('../util');

const NUMERIC_SORT = (a, b) => a - b;

/**
 * # [Advent of Code 2015 Day 02](https://adventofcode.com/2015/day/02)
 *
 * Computing the slack paper and the ribbon around a box both require the
 * smallest two dimensions of a box. Since box orientation doesn't matter, I
 * simply sort the dimensions by size so that the ones at indexes `0` and `1`
 * are the smallest. The amount of paper used for a box (assuming the
 * dimensions from smallest to largest are called `l`, `w`, and `h`) is:
 * 
 * ```
 * 3 * l * w + 2 * w * h + 2 * h * l
 * ```
 * 
 * ...while the amount of ribbon is:
 * 
 * ```
 * 2 * l + 2 * w + l * w * h
 * ```
 *
 * Add them up for each box to get the answers.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => compute(parse(input));

/**
 * Parses the box dimensions.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - a two-dimensional array of box dimensions
 */
const parse = input => split(input)
  .map(line => line.split('x').map(Number).sort(NUMERIC_SORT));

/**
 * Computes the paper and ribbon requirements.
 *
 * @param {Array} boxen - the box dimensions array
 * @returns {Array} - the puzzle answers
 */
const compute = boxen => {
  const result = boxen.map(([ l, w, h ]) => ({
    paper: 3 * l * w + 2 * w * h + 2 * h * l,
    ribbon: 2 * l + 2 * w + l * w * h,
  })).reduce((acc, { paper, ribbon }) => {
    acc.paper += paper;
    acc.ribbon += ribbon;
    return acc;
  }, { paper: 0, ribbon: 0 });
  return [ result.paper, result.ribbon ];
};
