const { add } = require('../math2');
const { split } = require('../util');

/**
 * # [Advent of Code 2018 Day 1](https://adventofcode.com/2018/day/1)
 *
 * There is nothing fancy you have for this one. For part one you simply add up
 * the numbers and report the result. For part two, you just need to keep
 * adding the numbers (looping around as needed) until you encounter the same
 * sum again. This is easily done by putting each sum into a `Set`, checking
 * first to see if it's already there.
 *
 * Since some of the part one examples will never terminate if used for part
 * two, the optional `part` argument allows you to specify which part you want
 * to return. If omitted, it returns them both.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part to solve
 * @returns {Array} - the puzzle solution(s)
 */
module.exports = (input, part) => {
  const changes = split(input, { parseInt: true });
  const parts = [ add, part2 ];

  if (part) {
    return parts[part - 1](changes);
  }

  return parts.map(fn => fn(changes));
};

/**
 * Produces the answer to part two of the puzzle.
 *
 * @param {Array} changes - the changes array
 * @returns {number} - the answer to part two
 */
const part2 = changes => {
  const seen = new Set();
  seen.add(0);
  let sum = 0, i = 0;

  do {
    sum += changes[i];

    if (seen.has(sum)) {
      return sum;
    }

    seen.add(sum);
    i = (i + 1) % changes.length;
  } while (true);
};
