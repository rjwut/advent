const REGEXP = /row (\d+), column (\d+)/;
const START_CODE = 20151125;
const FACTOR = 252533;
const DIVISOR = 33554393;

/**
 * # [Advent of Code 2015 Day 25](https://adventofcode.com/2015/day/25)
 *
 * I felt like I could have done something fancy with triangular numbers or
 * something like that here, but it turns out brute force is plenty fast. So
 * I just keep computing the next code, tracking my position in the grid until
 * I got to the target cell.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const [ tr, tc ] = input.match(REGEXP)
    .slice(1)
    .map(el => parseInt(el, 10));

  let code = START_CODE, r = 1, c = 1;

  do {
    code = code * FACTOR % DIVISOR;

    if (r === 1) {
      r = c + 1;
      c = 1;
    } else {
      r--;
      c++;
    }
  } while (r !== tr || c !== tc);

  return [ code, undefined ];
};
