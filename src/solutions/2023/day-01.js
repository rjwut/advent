const { split } = require('../util');
const { add } = require('../math2');

const DIGIT_NAMES = [ 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine' ];
const REGEXPS = [
  /\d/,
  new RegExp(`\\d|${DIGIT_NAMES.join('|')}`),
];

/**
 * # [Advent of Code 2023 Day 1](https://adventofcode.com/2023/day/1)
 *
 * The main thing that can trip you up on this one is that the digit names can overlap. For
 * example, the answer for a line that reads `'oneight'` should be `18`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const lines = split(input);

  if (part !== undefined) {
    return solve(lines, REGEXPS[part - 1]);
  }

  return REGEXPS.map(regexp => solve(lines, regexp));
};

/**
 * Solve the puzzle for the given lines and digit recogniztion `RegExp`.
 *
 * @param {Array<string>} lines - the input lines
 * @param {RegExp} regexp - the regular expression that identifies the digits
 * @returns {number} - the answer for this part
 */
const solve = (lines, regexp) => add(
  lines.map(line => {
    let digits = extractDigits(line, regexp);
    digits = [ digits[0], digits[digits.length - 1] ].map(coerceDigit);
    return digits[0] * 10 + digits[1];
  })
);

/**
 * Extracts all the digits out of this line. Takes into account the fact that digit names can
 * overlap.
 *
 * @param {string} line - the line to extract digits from
 * @param {RegExp} regexp - the regular expression that identifies the digits
 * @returns {Array<string>} - the extracted digits
 */
const extractDigits = (line, regexp) => {
  const digits = [];
  let match;

  do {
    match = line.match(regexp);

    if (match) {
      match = match[0];
      digits.push(match);
      line = line.slice(line.indexOf(match) + 1);
    }
  } while (match);

  return digits;
};

/**
 * Coerces a digit string to its numeric value. This handles both `0`-`9` and the digit names.
 *
 * @param {string} digit - the digit string
 * @returns {number} - the corresponding numeric value
 */
const coerceDigit = digit => digit.length === 1 ? parseInt(digit, 10) : DIGIT_NAMES.indexOf(digit) + 1;
