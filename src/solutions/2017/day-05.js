const { split } = require('../util');

/**
 * # [Advent of Code 2017 Day 5](https://adventofcode.com/2017/day/5)
 *
 * Not much to say about this one. Jumps are kept in an array, and the `ip`
 * variable represents the instruction pointer as it moves around. The biggest
 * thing to remember is that the number at the instruction pointer is the
 * amount by which it should be moved _before_ you change it, not after.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const jumps = split(input, { parseInt: true });
  return [ part1, part2 ].map(fn => fn(jumps));
};

const part1 = jumps => {
  jumps = [ ...jumps ];
  let ip = 0;
  let steps = 0;

  do {
    ip += jumps[ip]++;
    steps++;
  } while (ip >= 0 && ip < jumps.length);

  return steps;
};

const part2 = jumps => {
  let ip = 0;
  let steps = 0;

  do {
    const offset = jumps[ip];
    jumps[ip] += (offset > 2 ? -1 : 1);
    ip += offset;
    steps++;
  } while (ip >= 0 && ip < jumps.length);

  return steps;
};
