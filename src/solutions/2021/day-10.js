const { split } = require('../util');

const OPENING_BRACKETS = [ '(', '[', '{', '<' ];
const CLOSING_BRACKETS = [ ')', ']', '}', '>' ];
const CORRUPT_POINTS = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};
const INCOMPLETE_POINTS = {
  '(': 1,
  '[': 2,
  '{': 3,
  '<': 4,
};

/**
 * # [Advent of Code 2021 Day 10](https://adventofcode.com/2021/day/10)
 *
 * To evaluate a line, we iterate its characters. If we encounter an opening
 * bracket, we push it onto the stack. If we encounter a closing bracket, we
 * pop the most recent opening bracket from the stack and compare it to the
 * closing bracket. If they match, we continue on our way. If they don't match,
 * the line is corrupt. If we get to the end of the line without encountering a
 * mismatch, the brackets left in the stack are the ones left open. You can
 * produce the brackets needed to complete the line by reversing the order of
 * the brackets in the stack and converting them to their corresponding closing
 * brackets.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const lines = split(input).map(evaluate);
  return [ part1, part2 ].map(fn => fn(lines));
};

/**
 * Computes the score for part one. This is the sum of the point values for the
 * mismatched closing brackets for each corrupt line.
 *
 * @param {Array} lines - the lines to evaluate 
 * @returns {number} - the score for part one
 */
const part1 = lines => lines.reduce((score, line) => {
  if (line.corrupt) {
    score += CORRUPT_POINTS[line.chr];
  }

  return score;
}, 0);

/**
 * Computes the score for part two. This is determined by first computing a
 * score for each incomplete line: Start with a score of `0`, and for each
 * closing bracket required to complete the line, multiply the score by `5`
 * and add the point value for the bracket. Make sure to do them in the order
 * that they would be encountered left to right if they were added to the end
 * of the line (innermost first).
 *
 * Once each incomplete line has a score, sort them and select the middle one
 * as the answer to part two.
 *
 * @param {Array} lines - the lines to evaluate 
 * @returns {number} - the score for part two
 */
const part2 = lines => {
  const scores = lines
    .filter(line => !line.corrupt)
    .map(line => {
      return line.stack.reverse().reduce((score, chr) => {
        score = score * 5 + INCOMPLETE_POINTS[chr];
        return score;
      }, 0);
    })
    .sort((a, b) => a - b);
  return scores[(scores.length - 1) / 2];
};

/**
 * Analyzes the given line and returns an object with the following properties:
 *
 * - `corrupt` (boolean): whether the line is corrupt
 * - `chr` (string): the first mismatched closing bracket (if `corrupt` is
 *   `true`)
 * - `stack` (array): the stack of brackets left open (if `corrupt` is `false`)
 *
 * @param {string} line - the line to evaluate
 * @returns {Object} - the result object
 */
const evaluate = line => {
  const stack = [];

  for (let chr of [ ...line ]) {
    if (OPENING_BRACKETS.includes(chr)) {
      stack.push(chr);
    } else {
      const pos = CLOSING_BRACKETS.indexOf(chr);

      if (pos === -1) {
        throw new Error(`Unexpected character: ${chr}`);
      }

      const openingBracket = stack.pop();

      if (openingBracket !== OPENING_BRACKETS[pos]) {
        return {
          corrupt: true,
          chr,
        };
      }
    }
  }

  return {
    corrupt: false,
    stack,
  };
};
