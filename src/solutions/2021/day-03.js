const { split } = require('../util');

/**
 * # [Advent of Code 2021 Day 3](https://adventofcode.com/2021/day/3)
 *
 * The common functionality between the two parts is the need to compute the
 * most common bit value in a position, which is handled by the
 * `computeBitCounts()` function.
 * 
 * Part one is implemented with `computePowerConsumption()`, which simply calls
 * `computeBitCounts()` for each position, and assigns the appropriate bit to
 * each rate value, then multiplies them together.
 *
 * Part two is implemented with `computeLifeSupportRating()`. Here, the report
 * has to be filtered twice, once for the O2 generator rating, and once for the
 * CO2 scrubber rating. The `filterForBitCriteria()` function is used to
 * perform the filtering, returning a single value from the report for each.
 * They are then multiplied together and returned.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const lines = split(input);
  return [
    computePowerConsumpution(lines),
    computeLifeSupportRating(lines),
  ];
};

/**
 * Performs the power consumption calculation for part one of the puzzle.
 *
 * @param {Array} lines - the diagnostic report
 * @returns {number} - the power consumption
 */
const computePowerConsumpution = lines => {
  const gammaBits = [], epsilonBits = [];
  const size = lines[0].length;

  for (let i = 0; i < size; i++) {
    const bitCounts = computeBitCounts(lines, i);
    gammaBits[i] = bitCounts[0] < bitCounts[1] ? '0' : '1';
    epsilonBits[i] = gammaBits[i] === '1' ? '0' : '1';
  }

  const gamma = parseInt(gammaBits.join(''), 2);
  const epsilon = parseInt(epsilonBits.join(''), 2);
  return gamma * epsilon;
};

/**
 * Performs the life support rating calculation for part two of the puzzle.
 *
 * @param {Array} lines - the diagnostic report
 * @returns {number} - the life support rating
 */
 const computeLifeSupportRating = lines => {
  const o2Bits = filterForBitCriteria(lines, true);
  const co2Bits = filterForBitCriteria(lines, false);
  const o2 = parseInt(o2Bits, 2);
  const co2 = parseInt(co2Bits, 2);
  return o2 * co2;
};

/**
 * Returns an array containing the number of times each bit value appears at
 * the indicated bit position in the diagnostic report.
 *
 * @param {Array} lines - the diagnostic report
 * @param {number} bit - the index of the bit position to count
 * @returns {Array} - element 0 reports the number of times the `0` bit value
 * appeared, while element 1 reports for the `1` bit value.
 */
const computeBitCounts = (lines, bit) => {
  return lines.reduce((counts, line) => {
    const c = line.charAt(bit);
    counts[c === '0' ? 0 : 1]++;
    return counts;
  }, [ 0, 0 ]);
}

/**
 * Filters the diagnostic report to find the entry corresponding to the O2
 * generator rating (if `forO2` is `true`) or the CO2 scrubber rating (if
 * `forO2` is `false`).
 *
 * @param {Array} lines - the diagnostic report
 * @param {boolean} forO2 - whether to find the O2 generator rating
 * @returns {string} - the line corresponding to the desired rating
 */
const filterForBitCriteria = (lines, forO2) => {
  let linesLeft = [ ...lines ];
  let index = 0;

  while (linesLeft.length > 1) {
    const bitCounts = computeBitCounts(linesLeft, index);
    const mostCommon = bitCounts[0] > bitCounts[1] ? '0' : '1';
    const keep = forO2 ? mostCommon : mostCommon === '1' ? '0' : '1';
    linesLeft = linesLeft.filter(line => line.charAt(index) === keep);
    index++;
  }

  return linesLeft[0];
};
