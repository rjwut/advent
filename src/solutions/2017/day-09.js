/**
 * # [Advent of Code 2017 Day 9](https://adventofcode.com/2017/day/9)
 *
 * Declare four variables:
 *
 * - `score`: The current running score (starts at `0`)
 * - `indent`: The current indentation level (starts at `0`)
 * - `garbage`: Whether we're currently processing garbage (starts at `false`)
 * - `garbageCount`: The number of garbage characters we've seen (starts at `0`)
 *
 * Iterate the characters in the input string, and execute the first rule that
 * matches for each one:
 *
 * - If the current character is `!`, skip the next character.
 * - If the current character is not `>` and `garbage` is `true`, increment
 *   `garbageCount`.
 * - If the current character is `<`, set garbage to `true`.
 * - If the current character is `>`, set garbage to `false`.
 * - If the current character is `{`, increment `indent`, then increase `score`
 *   by `indent`.
 * - If the current character is `}`, decrement `indent`.
 *
 * When all characters have been processed, `score` and `garbageCount` contain
 * the answers.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  let score = 0, indent = 0, garbage = false, garbageCount = 0;

  for (let i = 0; i < input.length; i++) {
    const chr = input.charAt(i);

    if (chr === '!') {
      i++;
      continue;
    }

    if (garbage && chr !== '>') {
      garbageCount++;
      continue;
    }

    if (chr === '<') {
      garbage = true;
      continue;
    }

    if (chr === '>') {
      garbage = false;
      continue;
    }

    if (chr === '{') {
      score += ++indent;
      continue;
    }

    if (chr === '}') {
      indent--;
    }
  }

  return [ score, garbageCount ];
};
