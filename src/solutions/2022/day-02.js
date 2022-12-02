const { split } = require('../util');
const { add } = require('../math2');

const THROWS = {
  'A X': [ 4, 3 ],
  'A Y': [ 8, 4 ],
  'A Z': [ 3, 8 ],
  'B X': [ 1, 1 ],
  'B Y': [ 5, 5 ],
  'B Z': [ 9, 9 ],
  'C X': [ 7, 2 ],
  'C Y': [ 2, 6 ],
  'C Z': [ 6, 7 ],
};

/**
 * # [Advent of Code 2022 Day 2](https://adventofcode.com/2022/day/2)
 *
 * I started out making this harder than it needed to be: actually translating the symbols to their
 * meanings for each part, then translating that into a result and computing the points from that.
 * Then I realized that it could be much simpler: The code didn't have to actually understand how
 * the game worked. For each line, there are only nine possible strings, and each one has a unique
 * point value in each part. I simply had to make a data structure that stored the value of each of
 * the nine possible symbol combinations, then translate each line to that value. Then just add
 * them up to get the answer for that part.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const throws = split(input);
  return [ 0, 1 ].map(i => add(throws.map(throwStr => THROWS[throwStr][i])));
};
