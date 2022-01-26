/**
 * # [Advent of Code 2017 Day 1](https://adventofcode.com/2017/day/1)
 *
 * Very straightforward. I convert the characters to numbers by subtracting
 * `48` from their character codes. Both parts can be solved with the same
 * code simply by specifying an offset of `1` for part one and `length / 2` for
 * part two.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - which part of the puzzle to solve
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  input = input.trim();
  const parts = [ 1, input.length / 2 ];

  if (part) {
    return computeSum(input, parts[part - 1]);
  }

  return parts.map(offset => computeSum(input, offset));
};

/**
 * Computes the sum of all the digits that meet the criteria outlined in the
 * puzzle.
 *
 * @param {string} input - the puzzle input
 * @param {number} offset - the size of the offset separating the characters to
 * be compared
 * @returns {number} - the desired sum
 */
const computeSum = (input, offset) => {
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    let j = (i + offset) % input.length;
    const val1 = input.charCodeAt(i) - 48;
    const val2 = input.charCodeAt(j) - 48;

    if (val1 === val2) {
      sum += val1;
    }
  }

  return sum;
};
