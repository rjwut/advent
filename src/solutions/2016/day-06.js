const { split } = require('../util');

/**
 * # [Advent of Code 2016 Day 6](https://adventofcode.com/2016/day/6)
 *
 * Again, both parts of the puzzle can be performed in a single pass. I create
 * an array where I compute the letter frequencies for each character index in
 * the message, then sort that by frequency. The most and least frequent
 * letters in each slot are used to create the answers for each part.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const messages = split(input);

  // Compute letter frequencies for each character index
  const counts = new Array(messages[0].length);

  for (let i = 0; i < counts.length; i++) {
    counts[i] = {};
  }

  messages.forEach(message => {
    for (let i = 0; i < message.length; i++) {
      const letter = message[i];
      counts[i][letter] = (counts[i][letter] ?? 0) + 1;
    }
  });

  // Convert dictionaries to arrays and sort by frequency
  const countsArrays = counts.map(letterCounts => {
    return Object.entries(letterCounts).sort((a, b) => b[1] - a[1]);
  });

  // Take the most and least frequent letters for each slot
  return [
    countsArrays.map(countsArray => countsArray[0][0]).join(''),
    countsArrays.map(countsArray => countsArray[countsArray.length - 1][0]).join(''),
  ];
};
