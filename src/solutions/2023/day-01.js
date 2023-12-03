const { split } = require('../util');
const { add } = require('../math2');

const DIGIT_NAMES = [ 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine' ];
const DIGIT_NAMES_REGEXP = new RegExp(DIGIT_NAMES.join('|'));
const NORMALIZED_DIGITS = [ 'o1e', 't2o', 't3e', 'f4r', 'f5e', 's6x', 's7n', 'e8t', 'n9e' ];

/**
 * Extracts all digits from the given string.
 *
 * @param {string} str - the string to search
 * @returns {Array<number>} - the digits
 */
const extractDigits = str => str.match(/\d/g)
  .map(digit => parseInt(digit, 10));

/**
 * Normalizes the names of digits in the given string; e.g. `'eight' -> 'e8t'`.
 *
 * @param {string} str - the string to normalize
 * @returns {string} - the normalized string
 */
const normalizeDigitNames = str => {
  let match;

  do {
    match = str.match(DIGIT_NAMES_REGEXP);

    if (match) {
      const word = match[0];
      str = str.substring(0, match.index) +
        NORMALIZED_DIGITS[DIGIT_NAMES.indexOf(word)] +
        str.substring(match.index + word.length);
    }
  } while (match);

  return str;
};

/*
 * For part one, we just extract the digits.
 * For part two, we normalize the digit names first.
 */
const DIGIT_FINDERS = [
  extractDigits,
  str => extractDigits(normalizeDigitNames(str)),
];

/**
 * # [Advent of Code 2023 Day 1](https://adventofcode.com/2023/day/1)
 *
 * The main thing that can trip you up on this one is that the digit names can overlap. For
 * example, the answer for a line that reads `'oneight'` should be `18`. So for part two, we
 * normalize each digit name to a string that starts and ends with the same characters and has the
 * actual digit between them, e.g. `'eight'` becomes `'e8t'`. When that's done, we can extract the
 * digits from the resulting string the same way we do for part one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const lines = split(input);

  if (part !== undefined) {
    return solve(lines, DIGIT_FINDERS[part - 1]);
  }

  return DIGIT_FINDERS.map(regexp => solve(lines, regexp));
};

/**
 * Solve the puzzle for the given lines and digit finding function.
 *
 * @param {Array<string>} lines - the input lines
 * @param {Function} fn - a function which extracts all the digits
 * @returns {number} - the answer for this part
 */
const solve = (lines, fn) => add(
  lines.map(line => {
    let digits = fn(line);
    return digits[0] * 10 + digits[digits.length - 1];
  })
);
