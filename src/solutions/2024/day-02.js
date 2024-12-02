const { split } = require('../util');

/**
 * # [Advent of Code 2024 Day 2](https://adventofcode.com/2024/day/2)
 *
 * I perform a single pass over the input, keeping a counter of safe reports for each part of the
 * puzzle. For each report, I check if it is safe. If it is, I increment both counters. If it is not,
 * I iterate over the report, removing each element one at a time and checking if the new report is
 * safe. If it is, I increment the second counter and break the inner loop.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input).map(
    row => split(row, { delimiter: ' ', parseInt: true })
  );
  const safe = [ 0, 0 ];
  input.forEach(report => {
    if (isSafe(report)) {
      // All reports safe for part 1 are safe for part 2, as well.
      safe[0]++;
      safe[1]++;
    } else {
      // Not safe for part 1; can we remove an element to make it safe?
      for (let i = 0; i < report.length; i++) {
        const newReport = report.toSpliced(i, 1)

        if (isSafe(newReport)) {
          // Safe for part 2 only.
          safe[1]++;
          break;
        }
      }
    }
  });
  return safe;
};

/**
 * Checks whether the given report is safe. To be safe, the magnitude of differences between
 * adjacent values must be between 1 and 3 (inclusive), and the sign of all differences must be
 * consistent.
 *
 * @param {number[]} report - the report to check
 * @returns {boolean} - `true` if safe; `false` otherwise
 */
const isSafe = report => {
  const expectedSign = Math.sign(report[0] - report[1]);

  for (let i = 1; i < report.length; i++) {
    const a = report[i - 1];
    const b = report[i];
    const sign = Math.sign(a - b);
    const diff = Math.abs(a - b);

    if (expectedSign !== sign || diff < 1 || diff > 3) {
      return false;
    }
  }

  return true;
};
