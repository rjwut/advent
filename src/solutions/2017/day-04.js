const { split } = require('../util');

/**
 * # [Advent of Code 2017 Day 4](https://adventofcode.com/2017/day/4)
 *
 * This one's pretty easy. We split the input into lines, and each line into an
 * array of words.  For each part, we create a filter function that returns
 * `true` only for passphrases that are valid for that part. After filtering
 * the passphrases, the number of passphrases that pass the filter is the
 * answer.
 *
 * For part one, we simply stick the words in the passphrase into a `Set`. If
 * the number of words in the `Set` is the same as the number of words in the
 * passphrase, there are no repeated words and the passphrase is valid. We do
 * the same thing for part two, except that we sort the letters in each
 * word first.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const passphrases = split(input).map(line => line.split(' '));
  const noRepeats = passphrases.filter(repeatFilter);
  const noAnagrams = noRepeats.filter(anagramFilter);
  return [ noRepeats.length, noAnagrams.length ];
};

/**
 * Predicate function that only accepts passphrases with no repeated words.
 *
 * @param {Array} passphrase - the passphrase to test
 * @returns {boolean} - `true` if the passphrase contains no repeated words;
 * `false` otherwise
 */
const repeatFilter = passphrase => new Set(passphrase).size === passphrase.length;

/**
 * Predicate function that only accepts passphrases with no anagrams.
 *
 * @param {Array} passphrase - the passphrase to test
 * @returns {boolean} - `true` if the passphrase contains no anagrams; `false`
 * otherwise
 */
const anagramFilter = passphrase => {
  const sorted = passphrase.map(word => [ ...word ].sort().join(''));
  return new Set(sorted).size === sorted.length;
};
