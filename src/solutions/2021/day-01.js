const { add } = require('../math2');
const { split } = require('../util');

/**
 * # [Advent of Code 2021 Day 1](https://adventofcode.com/2021/day/1)
 *
 * The two parts of the puzzle can use the same implementation, just with part
 * one using a window size of `1` and part two using a window size of `3`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const depths = split(input, { parseInt: true });
  return [
    countIncreases(depths, 1),
    countIncreases(depths, 3),
  ];
};

/**
 * Given an array of depths, and a window size, count the number of times that
 * the sum of the values in the sliding window increases.
 *
 * @param {Array} depths - the depth values
 * @param {number} windowSize - the size of the sliding window
 * @returns {number} - the number of increases
 */
const countIncreases = (depths, windowSize) => {
  let prevSum = null, timesIncreased = 0;

  for (let i = windowSize; i <= depths.length; i++) {
    const window = depths.slice(i - windowSize, i);
    const sum = add(window);

    if (prevSum !== null && sum > prevSum) {
      timesIncreased++;
    }

    prevSum = sum;
  }

  return timesIncreased;
};
