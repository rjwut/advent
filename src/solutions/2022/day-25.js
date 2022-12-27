const { split } = require('../util');

const SNAFUGIT = {
  '2': 2,
  '1': 1,
  '0': 0,
  '-': -1,
  '=': -2,
};
const SUMS = [
  '-0',
  '-1',
  '-2',
  '0=',
  '0-',
  '00',
  '01',
  '02',
  '1=',
  '1-',
  '10',
];

/**
 * # [Advent of Code 2022 Day 25](https://adventofcode.com/2022/day/25)
 *
 * At first I was thinking that I'd translate SNAFU numbers to decimal, add up the numbers, then
 * convert the sum back to SNAFU. The conversion to decimal wasn't too bad, but I found converting
 * from decimal to SNAFU to be difficult to wrap my head around. Then I realized that I didn't need
 * to convert to and from decimal at all: I could just directly implement SNAFU addition.
 *
 * SNAFU numbers are represented as strings, where each character is a SNAFU "digit" (what I'll
 * call a "snafugit"). To review, the snafugit values are as follows:
 *
 * | snafugit | value |
 * | -------: | ----: |
 * |      `2` |   `2` |
 * |      `1` |   `1` |
 * |      `0` |   `0` |
 * |      `-` |  `-1` |
 * |      `=` |  `-2` |
 *
 * It's easy enough to produce an addition table between all of the five snafugits, but we also
 * have to be able to handle carry snafugits. So in each place, we convert the two snafugits to be
 * added and any carry snafugit to their values, add them together, then look up the resulting
 * value and carry snafugits for the result. The largest possible carry magnitude is 1, so we need
 * to be able to handle values from -5 to 5:
 *
 * | value | in SNAFU |
 * | ----: | -------: |
 * |  `-5` |     `-0` |
 * |  `-4` |     `-1` |
 * |  `-3` |     `-2` |
 * |  `-2` |     `0=` |
 * |  `-1` |     `0-` |
 * |   `0` |     `00` |
 * |   `1` |     `01` |
 * |   `2` |     `02` |
 * |   `3` |     `1=` |
 * |   `4` |     `1-` |
 * |   `5` |     `10` |
 *
 * In the table above, the left snafugit is the carry.
 *
 * So after left padding the shorter SNAFU number with `0` until they're the same length, we
 * iterate the snafugits from right to left, adding them together along with any carry value as
 * described above. At the end, if the carry snafugit is not `0`, it is prepended to the result.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answer
 */
module.exports = input => [
  split(input).reduce((sum, snafu) => add(sum, snafu), '0'),
  undefined,
];

/**
 * Adds two SNAFU numbers.
 *
 * @param {string} snafu1 - the first SNAFU number
 * @param {string} snafu2 - the second SNAFU number
 * @returns {string} - the sum
 */
const add = (snafu1, snafu2) => {
  const length = Math.max(snafu1.length, snafu2.length);
  snafu1 = snafu1.padStart(length, '0');
  snafu2 = snafu2.padStart(length, '0');
  const snafu3 = [];
  let carry = '0';

  for (let i = length - 1; i >= 0; i--) {
    const snafugit1 = snafu1.charAt(i);
    const snafugit2 = snafu2.charAt(i);
    const sum = SNAFUGIT[snafugit1] + SNAFUGIT[snafugit2] + SNAFUGIT[carry];
    const snafuSum = SUMS[sum + 5];
    carry = snafuSum.charAt(0);
    snafu3.unshift(snafuSum.charAt(1));
  }

  if (carry !== '0') {
    snafu3.unshift(carry);
  }

  return snafu3.join('');
}
