const { split } = require('../util');

/**
 * # [Advent of Code 2017 Day 2](https://adventofcode.com/2017/day/2)
 *
 * Both parts of the puzzle perform some sort of operation on each row, then
 * sum the results, so the operation in question is broken off into separate
 * functions.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part to solve
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const rows = split(input).map(line => split(line, { delimiter: '\t', parseInt: true }));
  const parts = [ maximumDifference, onlyEvenlyDivisible ];

  if (part) {
    return sumResults(rows, parts[part - 1]);
  }

  return parts.map(fn => sumResults(rows, fn));
};

/**
 * Calls `fn()` on each row of the given array, and sums the return values.
 *
 * @param {Array} rows - the array of rows
 * @param {Function} fn - the function to invoke on each row
 * @returns {number} - the sum of the values returned by `fn()`
 */
const sumResults = (rows, fn) => rows.reduce((sum, row) => sum + fn(row), 0);

/**
 * Computes the difference between the largest and smallest values in `row`.
 *
 * @param {Array} row - an array of numbers
 * @returns {number} - the difference
 */
const maximumDifference = row => Math.max(...row) - Math.min(...row);

/**
 * Computes the quotient of the only two numbers in `row` where one is evenly
 * divisible by the other.
 *
 * @param {Array} row - an array of numbers 
 * @returns {number} - the quotient
 */
const onlyEvenlyDivisible = row => {
  let limit = row.length - 1;

  for (let i = 0; i < limit; i++) {
    const value1 = row[i];

    for (let j = i + 1; j < row.length; j++) {
      const value2 = row[j];
      const dividend = Math.max(value1, value2);
      const divisor = Math.min(value1, value2);

      if (dividend % divisor === 0) {
        return dividend / divisor;
      }
    }
  }
};
