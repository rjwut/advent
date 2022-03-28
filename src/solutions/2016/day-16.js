/**
 * # [Advent of Code 2016 Day 16](https://adventofcode.com/2016/day/16)
 *
 * The implementation for this day's puzzle is fairly striaghtforward. The
 * biggest thing to watch out for is to avoid performing any unneccessary
 * array operations when generating the data, since part two will make that
 * take a long time. Since JavaScript arrays are dynamic, the dragon curve
 * can be implemented simply by pushing a `'0'` into the array, then iterating
 * it backwards (skipping the final zero), and pushing the opposite bit of each
 * bit you read.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  return [ 272, 35651584 ].map(length => solve(input, length));
};

/**
 * Computes the checksum for the generated dragon curve data using the given
 * inital state and desired length.
 *
 * @param {string} input - the initial state (the puzzle input)
 * @param {number} length - the desired data length
 * @returns {string} - the checksum
 */
const solve = (input, length) => computeChecksum(generateData(input, length));

/**
 * Executes the dragon curve algorithm to generate the data, using the given
 * initial state and desired length.
 *
 * @param {string} input - the initial state (the puzzle input)
 * @param {number} length - the desired data length
 * @returns {Array} - the generated data
 */
const generateData = (input, length) => {
  let bits = [ ...input ];

  while (bits.length < length) {
    bits.push('0');

    for (let i = bits.length - 2; i >= 0; i--) {
      bits.push(bits[i] === '0' ? '1' : '0');
    }
  }

  bits.splice(length, bits.length - length);
  return bits;
};

/**
 * Computes the checksum for the given bits.
 *
 * @param {Array} bits - the bits to compute the checksum for
 * @returns {string} - the checksum
 */
const computeChecksum = bits => {
  let newBits;

  do {
    newBits = [];

    for (let i = 0; i < bits.length; i += 2) {
      newBits.push(bits[i] === bits[i + 1] ? '1' : '0');
    }

    bits = newBits;
  } while(bits.length % 2 === 0)

  return bits.join('');
};

module.exports.solve = solve;
