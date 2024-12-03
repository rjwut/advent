const { match } = require('../util');

const INSTRUCTION_REGEXP = /(?<op>mul|do|don't)\((?:(?<a>\d+),(?<b>\d+))?\)/g;

/**
 * # [Advent of Code 2024 Day 3](https://adventofcode.com/2024/day/3)
 *
 * I created a solution that solves both parts in a single pass. I wrote a regular expression that
 * matches the instructions in the input string, and leveraged my existing `match()` utility
 * function to easily convert them to an array of objects with three properties: `op` (the name of
 * the operation being performed), and `a` and `b` (the two operands, if applicable). I kept a
 * running sum for both parts as I iterated through, enabling and disabling operations as the
 * `do()` and `don't()` instructions were encountered. If enabled, the product of the `mul()`
 * operands was added to both answers; otherwise, only the answer for part one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const answers = [ 0, 0 ];
  let enabled = true;
  const instructions = match(input, INSTRUCTION_REGEXP, { a: Number, b: Number });
  instructions.forEach(({ op, a, b }) => {
    if (op === 'do') {
      enabled = true;
    } else if (op === 'don\'t') {
      enabled = false;
    } else if (op === 'mul') {
      const product = a * b;
      answers[0] += product;

      if (enabled) {
        answers[1] += product;
      }
    }
  });
  return answers;
};
