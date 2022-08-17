const { createHash } = require('crypto');

/**
 * # [Advent of Code 2015 Day 4](https://adventofcode.com/2015/day/4)
 *
 * There's no trick to this; brute force is the only solution. Simply iterate
 * the numbers until you find the one that produces a hash that has the correct
 * prefix. I search for both answers in a single search so I don't have to
 * generate any one hash twice.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  const prefixes = [ '00000', '000000' ];
  const answers = [ undefined, undefined ];
  let i = 0, hash;

  do {
    hash = createHash('md5')
      .update(`${input}${++i}`)
      .digest('hex');
    prefixes.forEach((prefix, j) => {
      if (answers[j] === undefined && hash.startsWith(prefix)) {
        answers[j] = i;
      }
    })
  } while (answers.some(answer => answer === undefined));

  return answers;
};
