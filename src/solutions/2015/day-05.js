const { split } = require('../util');

const VOWELS = new Set([ 'a', 'e', 'i', 'o', 'u' ]);
const PART1_NAUGHTY_PAIRS = {
  b: 'a',
  d: 'c',
  q: 'p',
  y: 'x',
};

/**
 * # [Advent of Code 2015 Day 5](https://adventofcode.com/2015/day/5)
 *
 * Pretty straightforward: test each string for "niceness" and count how many
 * strings were nice. For part one, the solution performs a single iteration
 * through each string to count vowels and search for doubled letters. If any
 * of the four naughty pairs are encountered, I bail out of the iteration
 * immediately. This produces a faster solution than if I performed each
 * niceness test separately.
 *
 * Part two can also be done in a single pass for each string. I iterate the
 * letters through the third-to-last one. For each letter, I execute the
 * following rules:
 *
 * - **Rule #1:** If this rule is not yet fulfilled, and we're not on the
 *   third-to-last letter in the string:
 *   1. Create a two-letter substring from this letter and the next one.
 *   2. Check the rest of the string (starting two characters to the right of
 *      the current letter) to see if the substring is repeated.
 *   3. If the substring is repreated, this rule is fulfilled.
 * - **Rule #2:** If this rule is not yet fulfilled:
 *   1. Check the letter two characters to the right of the current one.
 *   2. If they're the same, this rule is fulfilled.
 *
 * I can call the string nice the instant both rules are fulfilled. If I finish
 * iterating without fulfilling both rules, it's naughty.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const lines = split(input);
  return [ part1, part2 ].map(isNice => lines.filter(isNice).length);
};

/**
 * Determines whether the given string is "nice" according to the part 1 rules.
 *
 * @param {string} str - the string to test
 * @returns {boolean} - whether it's nice
 */
const part1 = str => {
  let vowelCount = 0, hasDouble = false, prevChr = null;

  for (let i = 0; i < str.length; i++) {
    const chr = str[i];

    if (VOWELS.has(chr)) {
      vowelCount++;
    } else if (PART1_NAUGHTY_PAIRS[chr] === prevChr) {
      return false;
    }

    hasDouble ||= chr === prevChr;
    prevChr = chr;
  }

  return vowelCount > 2 && hasDouble;
};

/**
 * Determines whether the given string is "nice" according to the part 1 rules.
 *
 * @param {string} str - the string to test
 * @returns {boolean} - whether it's nice
 */
const part2 = str => {
  const limit = str.length - 2;
  let rule1 = false, rule2 = false;

  for (let i = 0; i < limit; i++) {
    const chr = str[i];

    if (!rule1 && i + 1 !== limit) {
      const substring = chr + str[i + 1];
      rule1 = str.includes(substring, i + 2);
    }

    if (!rule2) {
      rule2 = chr === str[i + 2];
    }

    if (rule1 && rule2) {
      return true;
    }
  }

  return false;
};
