const { split } = require('../util');

const LENGTHS_TO_DIGITS = [
  [],
  [],
  [ 1 ],
  [ 7 ],
  [ 4 ],
  [ 2, 3, 5 ],
  [ 0, 6, 9 ],
  [ 8 ],
];
const UNIQUE_PATTERN_LENGTHS = [ 2, 3, 4, 7 ];

/**
 * # [Advent of Code 2021 Day 8](https://adventofcode.com/2021/day/8)
 *
 * There are two important things to remember when parsing the input:
 * 
 * - The letters representing each segment change for each display. Therefore,
 *   your deductions about which letter represents which segment are only valid
 *   for that display.
 * - The order of the segments in each pattern is random. To simplify things, I
 *   sort the letters in each pattern alphabetically so that there is only one
 *   possible string to represent that pattern in that display.
 *
 * To determine which pattern belongs to which digit, I look at which ones have
 * or don't have segments in common with already-known digits. The details for
 * this are in the comments for the `deduceDigits()` function.
 *
 * By following these rules, I can create a dictionary that can translate a
 * pattern to a digit. Then I simply apply that dictionary to translate the
 * output value for each display and sum them up.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = parse(input);
  return [ part1, part2 ].map(fn => fn(input));
};

/**
 * Parses each line of input into an object representing the display. Each
 * object has two properties:
 *
 * - `patterns`: an array of pattern strings for each possible digit
 * - `output`: an array of pattern strings for each digit in the output value
 *
 * All patterns are sorted alphabetically so that there is only one possible
 * string for each pattern. The patterns in the `patterns` property are in
 * random order, but those in `output` are in the order they appear on the
 * display.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - an array of display objects
 */
const parse = input => {
  return split(input).map(line => {
    const [ patterns, output ] = line.split(' | ');
    const display = {
      patterns: patterns.split(' '),
      output: output.split(' '),
    };
    display.patterns = display.patterns.map(pattern => [ ...pattern ].sort().join(''));
    display.output = display.output.map(pattern => [ ...pattern ].sort().join(''));
    return display;
  });
};

/**
 * Solves part 1 of the puzzle, which asks us to count how many times the
 * digits `1`, `4`, `7` or `8` appear in the output.
 *
 * @param {Array} input - the parsed puzzle input
 * @returns {number} - the number of times those digits appear in the output
 */
const part1 = input => {
  return input.reduce((count, display) => {
    return count + display.output.filter(hasUniqueNumberOfSegments).length;
  }, 0);
};

/**
 * Solves part 2 of the puzzle, which asks us to sum the output values (which
 * requires us to determine which pattern belongs to which digit).
 *
 * @param {Array} input - the parsed puzzle input
 * @returns {number} - the sum of the output values
 */
const part2 = input => {
  return input.reduce((sum, display) => {
    const dictionary = deduceDigits(display.patterns);
    const digits = display.output.map(pattern => dictionary[pattern]);
    const value = parseInt(digits.join(''), 10);
    return sum + value;
  }, 0);
};

/**
 * Returns true if the given pattern has a unique number of segments.
 *
 * @param {string} pattern - the pattern to check
 * @returns {boolean} - whether it has a unique number of segments
 */
const hasUniqueNumberOfSegments = pattern => {
  return UNIQUE_PATTERN_LENGTHS.includes(pattern.length);
};

/**
 * Deduces which digit each pattern belongs to. It does this by following these
 * rules:
 *
 * - First, find the patterns with unique lengths.
 *   - `1` has two segments.
 *   - `4` has four segments.
 *   - `7` has three segments.
 *   - `8` has seven segments.
 * - Next, find the three patterns that have five segments.
 *   - `3` is the only one that includes the segments from `1`.
 *   - `5` is the only one that includes the segments from `4` that aren't in `1`.
 *   - `2` is the five-segment pattern that isn't `3` or `5`.
 * - Finally, find the three patterns that have six segments.
 *   - `6` is the only one that doesn't include all the segments from `1`.
 *   - `9` is the only one that includes the segments from `4`.
 *   - `0` is the six-segment pattern that isn't `6` or `9`.
 *
 * @param {Array} patterns - the ten digit patterns
 * @returns {Object} - a dictionary that maps each pattern to a digit
 */
const deduceDigits = patterns => {
  const digits = [];

  // Patterns with unique lengths
  patterns.filter(hasUniqueNumberOfSegments).forEach(pattern => {
    const digit = LENGTHS_TO_DIGITS[pattern.length][0];
    digits[digit] = pattern;
  });

  // Five segment patterns
  let fiveSegmentPatterns = patterns.filter(pattern => pattern.length === 5);
  const threeIndex = fiveSegmentPatterns
    .findIndex(pattern => patternIncludesAllSegments(pattern, digits[1]));
  digits[3] = fiveSegmentPatterns[threeIndex];
  fiveSegmentPatterns.splice(threeIndex, 1);
  const segmentsInFourButNotOne = subtract(digits[4], digits[1]);
  const fiveIndex = fiveSegmentPatterns
    .findIndex(pattern => patternIncludesAllSegments(pattern, segmentsInFourButNotOne));
  digits[5] = fiveSegmentPatterns[fiveIndex];
  fiveSegmentPatterns.splice(fiveIndex, 1);
  digits[2] = fiveSegmentPatterns[0];

  // Six segment patterns
  let sixSegmentPatterns = patterns.filter(pattern => pattern.length === 6);
  const sixIndex = sixSegmentPatterns
    .findIndex(pattern => !patternIncludesAllSegments(pattern, digits[1]));
  digits[6] = sixSegmentPatterns[sixIndex];
  sixSegmentPatterns.splice(sixIndex, 1);
  const nineIndex = sixSegmentPatterns
    .findIndex(pattern => patternIncludesAllSegments(pattern, digits[4]));
  digits[9] = sixSegmentPatterns[nineIndex];
  sixSegmentPatterns.splice(nineIndex, 1);
  digits[0] = sixSegmentPatterns[0];

  // Build the dictionary
  return digits.reduce((dictionary, pattern, digit) => {
    dictionary[pattern] = digit;
    return dictionary;
  }, {});
};

/**
 * Returns whether the first pattern includes all the segments present in the
 * second pattern.
 *
 * @param {string} pattern1 - the pattern to check
 * @param {string} pattern2 - the pattern whose segments must be present in
 * `pattern1`
 * @returns {boolean} - whether `pattern1` includes all the segments present in
 * `pattern2`
 */
const patternIncludesAllSegments = (pattern1, pattern2) => {
  return [ ...pattern2 ].every(segment => pattern1.includes(segment));
};

/**
 * Returns a pattern that represents the removal of all the segments in
 * `pattern2` from `pattern1`.
 *
 * @param {string} pattern1 - the pattern to remove segments from
 * @param {string} pattern2 - the pattern containing the segments to remove
 * @returns {string} - the resulting pattern
 */
const subtract = (pattern1, pattern2) => {
  const set = new Set([ ...pattern1]);
  [ ...pattern2 ].forEach(segment => set.delete(segment));
  return [ ...set ].join('');
};
