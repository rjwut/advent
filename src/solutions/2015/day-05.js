const { split } = require('../util');

const VOWELS = new Set([ 'a', 'e', 'i', 'o', 'u' ]);
const NAUGHTY_PAIRS = {
  b: 'a',
  d: 'c',
  q: 'p',
  y: 'x',
};

/**
 * # [Advent of Code 2015 Day 5](https://adventofcode.com/2015/day/5)
 *
 * Pretty straightforward: test each string for "niceness" and count how many
 * strings were nice. The solution performs a single iteration through each
 * string to count vowels and search for doubled letters. If any of the four
 * naughty pairs are encountered, I bail out of the iteration immediately. This
 * produces a faster solution than if I performed each niceness test
 * separately.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const lines = split(input);
  const niceLines = lines.filter(isNice);
  return [ niceLines.length, undefined ];
};

/**
 * Determines whether the given string is "nice."
 *
 * @param {string} str - the string to test
 * @returns {boolean} - whether it's nice
 */
const isNice = str => {
  let vowelCount = 0, hasDouble = false, prevChr = null;

  for (let i = 0; i < str.length; i++) {
    const chr = str[i];

    if (VOWELS.has(chr)) {
      vowelCount++;
    } else if (NAUGHTY_PAIRS[chr] === prevChr) {
      return false;
    }

    hasDouble ||= chr === prevChr;
    prevChr = chr;
  }

  return vowelCount > 2 && hasDouble;
};
