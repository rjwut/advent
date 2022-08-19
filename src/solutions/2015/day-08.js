const { split } = require('../util');

const HEX_ESCAPE_REGEXP = /\\x([0-9a-f]{2})/g;

/**
 * # [Advent of Code 2015 Day 8](https://adventofcode.com/2015/day/8)
 *
 * It isn't really neccessary to generate the actual converted strings, but I
 * did anyway just to see if they produced anything interesting. (They didn't.)
 * There are a couple of things to watch out for:
 *
 * - While decoding, decode `\\` last (since the decoded `\` may subsequently
 *   be mistaken for the start of a new escape sequence).
 * - While encoding, you don't need to worry about `\xhh` sequences; they won't
 *   be needed.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const lines = split(input);
  const linesCharCount = countChars(lines);
  const valueLines = lines.map(codeToValue);
  const valueCharCount = countChars(valueLines);
  const codeLines = lines.map(valueToCode);
  const codeCharCount = countChars(codeLines);
  return [ linesCharCount - valueCharCount, codeCharCount - linesCharCount ];
};

/**
 * Counts the number of characters used by all the given strings.
 *
 * @param {Array<string>} lines - the lines whose characters should be counted
 * @returns {number} - the number of characters
 */
const countChars = lines => lines.reduce((count, line) => count + line.length, 0);

/**
 * Converts an encoded string to its corresponding value.
 *
 * @param {string} code - the encoded string
 * @returns {string} - the decoded value
 */
const codeToValue = code => code.substring(1, code.length - 1)
  .replaceAll(HEX_ESCAPE_REGEXP, replaceHexEscape)
  .replaceAll('\\"', '"')
  .replaceAll('\\\\', '\\');

/**
 * Converts a string value to its encoded form.
 *
 * @param {string} value - the string value to encode
 * @returns {string} - the encoded string
 */
const valueToCode = value => '"' + value.replaceAll('\\', '\\\\')
  .replaceAll('"', '\\"') + '"';

/**
 * Returns the character represented by the given `\xhh` escape sequence.
 *
 * @param {string} sequence - the escape sequence
 * @returns {string} - the corresponding character
 */
const replaceHexEscape = sequence => String.fromCharCode(
  parseInt(sequence.substring(2), 16)
);
