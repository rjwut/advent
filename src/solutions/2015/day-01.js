/**
 * # [Advent of Code 2015 Day 01](https://adventofcode.com/2015/day/01)
 *
 * The solution is straightforward: Iterate the input characters. If the
 * current character is `(`, increment the current floor; otherwise, decrement
 * it. If we're at `-1` for the first time, note the current position, which is
 * the answer to part two. The current floor after iteration is complete is the
 * answer to part one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let floor = 0;
  let enteredBasement;
  input.trim().split('').forEach((chr, i) => {
    floor += chr === '(' ? 1 : -1;

    if (enteredBasement === undefined && floor === -1) {
      enteredBasement = i + 1;
    }
  });
  return [ floor, enteredBasement ];
};
