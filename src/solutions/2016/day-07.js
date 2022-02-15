const { split } = require('../util');

/**
 * # [Advent of Code 2016 Day 7](https://adventofcode.com/2016/day/7)
 *
 * I split the input into lines, and split each line on the /\[|\]/ `RegExp` to
 * break the address into its supernet and hypernet components. (Even-indexed
 * parts are supernets, and odd-indexed parts are hypernets.) Then I can check
 * each part for the sequences specified by the puzzle. This is pretty
 * straightforward except for one little catch: In part two, an `ABA` pattern
 * may come _after_ its corresponding `BAB` pattern. So the trick is to iterate
 * all the supernets _first_ so that you can find all the `ABA` patterns, then
 * iterate the hypernets to find a corresponding `BAB` pattern. I do both parts
 * of the puzzle at the same time so I only have to iterate the addresses twice
 * instead of four times.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const analyses = split(input).map(analyze);
  return analyses.reduce((counts, analysis) => [
    counts[0] + (analysis.tls ? 1 : 0),
    counts[1] + (analysis.ssl ? 1 : 0),
  ], [ 0, 0 ]);
};

/**
 * Returns an object with two properties:
 *
 * - `tls` (boolean): Whether this address supports TLS.
 * - `ssl` (boolean): Whether this address supports SSL.
 *
 * @param {string} address - the address to analyze
 * @returns {Object} - the analysis
 */
const analyze = address => {
  const parts = address.split(/\[|\]/);
  let foundAbbaInSupernet = false, foundAbbaInHypernet = false;
  let soughtBabs = new Set(), foundAbaBabPair = false;

  // Iterate supernets
  for (let i = 0; i < parts.length; i += 2) {
    const part = parts[i];

    if (!foundAbbaInSupernet) {
      foundAbbaInSupernet = hasAbba(part);
    }

    findAbas(part).forEach(bab => soughtBabs.add(bab));
  }

  // Iterate hypernets
  for (let i = 1; i < parts.length; i += 2) {
    const part = parts[i];

    if (!foundAbbaInHypernet) {
      foundAbbaInHypernet = hasAbba(part);
    }

    if (!foundAbaBabPair) {
      foundAbaBabPair = findBabs(part, soughtBabs);
    }
  }

  return {
    tls: foundAbbaInSupernet && !foundAbbaInHypernet,
    ssl: foundAbaBabPair,
  };
};

/**
 * Determines whether this address part contains an `ABBA` pattern.
 *
 * @param {string} part - the address part to search
 * @returns {boolean} - whether this address part contains an `ABBA` pattern
 */
const hasAbba = part => {
  for (let i = 0; i < part.length - 3; i++) {
    const [ a, b, c, d ] = part.substring(i, i + 4);

    if (a === d && b === c && a !== b) {
      return true;
    }
  }

  return false;
};

/**
 * Returns the `BAB` patterns corresponding to the  `ABA` patterns found in
 * this address part.
 *
 * @param {string} part - the address part to search
 * @returns {Array} - the `BAB` patterns
 */
const findAbas = part => {
  const babs = [];

  for (let i = 0; i < part.length - 2; i++) {
    const [ a, b, c ] = part.substring(i, i + 3);

    if (a === c && a !== b) {
      babs.push(`${b}${a}${b}`);
    }
  }

  return babs;
};

/**
 * Determines whether this address part contains any of the given `BAB`
 * patterns.
 *
 * @param {string} part - the address part to search
 * @param {Set} babsToSeek - the `BAB` patterns to search for
 * @returns {boolean} - whether any of the given `BAB` patterns were found
 */
const findBabs = (part, babsToSeek) => [ ...babsToSeek ].some(bab => part.includes(bab));
