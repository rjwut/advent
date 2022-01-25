const { add } = require('../math2');
const { split } = require('../util');

const ENTRY_REGEX = /^(?<val1>\d+)-(?<val2>\d+) (?<chr>\S): (?<password>\S+)$/;

/**
 * # [Advent of Code 2020 Day 2](https://adventofcode.com/2020/day/2)
 *
 * I first parse each input line into an object with the four properties
 * described above. This is the first of many puzzles this year where I use a
 * [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
 * I use them here to extract the four values in each line.
 *
 * The validator for part one splits `password` into characters, filters them
 * down to just the ones that match `chr`, then counts them and checks to see
 * if the count is inside the expected range. The part two validator extracts
 * the characters from `password` at the positions `val1` and `val2`, converts
 * them to `1` if they match the `chr` and `0` if they don't, adds them
 * together, and asserts that the result equals `1`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
 module.exports = input => {
  input = split(input);
  return VALIDATORS.map(validator => solve(input, validator));
};

/**
 * Solves a part of the puzzle, returning the number of valid passwords in the
 * input, using the given validator.
 *
 * @param {Array} input - the puzzle input rows
 * @param {Function} validator - the password validation function to use
 * @returns {number} - the puzzle output
 */
const solve = (input, validator) => {
  return input.map(line => validator(parse(line)))
    .filter(entry => entry)
    .length;
};

/**
 * Parses a single input line and returns an object describing the contents of
 * that line. Each line has the following format:
 * ```
 * {val1}-{val2} {chr}: {password}
 * ```
 * The returned object has properties matching the names shown in the above
 * format string. The `val*` property are parsed as integers.
 *
 * @param {string} line - a line from the input file
 * @returns {Object} - the descriptor object
 */
const parse = line => {
  const result = line.match(ENTRY_REGEX).groups;
  return {
    ...result,
    val1: parseInt(result.val1, 10),
    val2: parseInt(result.val2, 10),
  };
};

/**
 * The validation functions for each of the puzzle parts.
 */
const VALIDATORS = [
  /**
   * Returns whether the object (as produced by `parse()`) describes a valid
   * password according to the part 1 password policy. That policy is: the
   * character `chr` must exist at least `val1` times and no more than `val2`
   * times in the `password`.
   * @param {Object} entry - the password entry
   * @returns {boolean} - whether the password is valid
   */
  entry => {
    const count = [ ...entry.password ]
      .filter(chr => chr === entry.chr)
      .length;
    return count >= entry.val1 && count <= entry.val2;
  },
  /**
   * Returns whether the object (as produced by `parse()`) describes a valid
   * password according to the part 2 password policy. That policy is: looking at
   * the characters at positions `val1` and `val2` (1-based) of `password`,
   * exactly one of those two characters must match the character `chr`.
   * @param {Object} entry - the password entry
   * @returns {boolean} - whether the password is valid
   */
  entry => add(
    [ 1, 2 ].map(i => {
      const pos = entry[`val${i}`] - 1;
      const chr = entry.password.charAt(pos);
      return chr === entry.chr ? 1 : 0;
    })
  ) === 1,
];
