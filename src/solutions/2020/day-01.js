const { add, multiply } = require('../math2');
const { split } = require('../util');

const TERM_COUNTS = [ 2, 3 ];
const TARGET = 2020;

/**
 * # [Advent of Code 2020 Day 1](https://adventofcode.com/2020/day/1)
 *
 * I wrote a single `find()` function that accepts the input and the number of
 * terms to search for. It iterates the input values and recurses until it gets
 * to the last term. For the last term, it just checks to see whether the value
 * that would add up to the target sum is present in the array.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input, { parseInt: true });
  return TERM_COUNTS.map(termCount => solve(input, termCount));
};

/**
 * Solves a part of the puzzle for the given number of terms to search for.
 *
 * @param {Array} input - the input numbers
 * @param {number} termCount - the number of terms being summed to find the target
 * @returns {number} - the puzzle output
 */
const solve = (input, termCount) => {
  const terms = find(input, termCount, []);
  return multiply(terms);
};

/**
 * Finds `termCount` terms that equal `TARGET` when summed.
 *
 * @param {Array} input - the array of input numbers
 * @param {number} termCount - the number of terms
 * @param {Array} terms - the terms collected so far in this recursive pass
 * @returns {Array} - the found terms
 */
const find = (input, termCount, terms) => {
  if (terms.length + 1 === termCount) {
    const lastTerm = TARGET - add(terms);

    if (lastTerm > 0 && input.includes(lastTerm)) {
      terms.push(lastTerm);
      return terms;
    }
  } else {
    for (let i = 0; i < input.length; i++) {
      const newTerms = [ ...terms, input[i] ];
      const newInput = Array.from(input);
      newInput.splice(i, 1);
      const answer = find(newInput, termCount, newTerms);

      if (typeof answer !== 'undefined') {
        return answer;
      }
    }
  }
};
