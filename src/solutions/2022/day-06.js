/**
 * # [Advent of Code 2022 Day 6](https://adventofcode.com/2022/day/6)
 *
 * Pretty straightforward today: Iterate the string, taking a substring whose length is equal to the
 * marker size for this part of the puzzle (4 for part 1, 14 for part 2). For each substring, break
 * it apart into an array of characters and put them into a `Set`. If the `Set` contains the same
 * number of entries as the marker size, there were no repeat characters, so that sequence is the
 * marker we're looking for, and the answer is the index immediately after the end of that
 * sequence.
 *
 * I made it slightly faster by starting the search for the 14-character marker at the position
 * where the 4-character marker started, since it can't possibly be found before it.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  const answer1 = findEndOfMarker(input, 4, 0);
  const answer2 = findEndOfMarker(input, 14, answer1 - 4);
  return [ answer1, answer2 ];
};

/**
 * Finds the first sequence of `windowSize` characters in `input` at or after index `startAt` that
 * has no repeated characters, and returns the first index immediately after that sequence.
 *
 * @param {string} input - the puzzle input
 * @param {number} markerSize - the size of the marker we're seeking
 * @param {number} startAt - the index to start seeking from
 * @returns {number} - the index immediately after the marker
 */
const findEndOfMarker = (input, markerSize, startAt) => {
  const limit = input.length - markerSize;

  for (let i = startAt; i < limit; i++) {
    const window = input.substring(i, i + markerSize);
    const set = new Set([ ...window ]);

    if (set.size === markerSize) {
      return i + markerSize;
    }
  }
};
