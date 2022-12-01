const { split } = require('../util')
const { add } = require('../math2')

/**
 * # [Advent of Code 2022 Day 1](https://adventofcode.com/2022/day/1)
 *
 * The hard work was done by some existing code I wrote for previous years:
 *
 * 1. My `split()` utility method already was able to read input line by line, group it on the
 *    blank lines, and parse each one as an integer. The result is an array of arrays, where each
 *    array represents the snacks held by a single elf.
 * 2. The `add()` function from my `math2` module was used as the callback for `map()`ping over
 *    each array to produce the sums of the snacks held by each elf. I now have a single array
 *    containing the total number of calories held by each elf.
 * 3. Now I just sort that array in descending order and grab the first three elements. The value
 *    at index `0` is the answer to part 1. The sum of all three (again supplied by `add()`) is
 *    the answer to part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const groups = split(input, { group: true, parseInt: true });
  const totals = groups.map(add).sort((a, b) => b - a);
  const top = totals.slice(0, 3);
  return [ top[0], add(top) ];
};
