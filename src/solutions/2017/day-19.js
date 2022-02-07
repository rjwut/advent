const { parseGrid } = require('../util');

const DIRECTIONS = [
  { r: -1, c:  0 }, // up
  { r:  0, c:  1 }, // right
  { r:  1, c:  0 }, // down
  { r:  0, c: -1 }, // left
];

/**
 * # [Advent of Code 2017 Day 19](https://adventofcode.com/2017/day/19)
 *
 * Tips:
 *
 * - There are two details that the puzzle doesn't explicitly mention that make
 *   things a little easier (for once!):
 *   - All letters are upper-case.
 *   - There is a margin of one space on all sides of the grid (with the
 *     exception of our starting location), so once we make the first move,
 *     we're guaranteed to never be on the edge of the grid again. This means
 *     that we don't have to worry about bounds checking.
 * - The `-` and `|` characters are functionally equivalent. It doesn't always
 *   correspond to your direction of travel, since the track crosses over
 *   itself at points.
 * - We only have to check in one direction on turn; if there's a space there,
 *   it's the other direction.
 *
 * Algorithm:
 *
 *  1. Find the only non-blank character on the top row of the grid.
 *  2. Start the packet at that location, facing down, having taken one step.
 *  3. Move one step in the current direction.
 *  4. If the current cell contains a space, go to step 10.
 *  6. Increment the step counter.
 *  7. If the current cell contains a letter, add it to the collected letters.
 *  8. If the current cell contains a `+`, try the cells to the left and right
 *     of the current location (considering the current direction). Whichever
 *     one does not contain a space, that is the new direction of travel.
 *  9. Go to step 3.
 * 10. The collected letters, concatenated as a string, are the answer to part
 *     one. The step counter is the answer to part two.
 *
 * Additional notes:
 *
 * - Direction is stored as an integer from `0` to `3`, corresponding to the
 *   elements in the `DIRECTIONS` array. Turning left is `(dir + 3) % 4`, while
 *   turning right is `(dir + 1) % 4`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = parseGrid(input);
  const packet = { r: 0, c: grid[0].findIndex(chr => chr !== ' '), d: 2 };
  let letters = '', steps = 1;

  do {
    const dir = DIRECTIONS[packet.d];
    packet.r += dir.r;
    packet.c += dir.c;
    const chr = grid[packet.r][packet.c];

    if (chr === ' ') {
      break; // We've reached the end of the track
    } else if (chr === '+') {
      // Check which direction the track continues; turn that direction
      const left = (packet.d + 3) % 4;
      const dirObj = DIRECTIONS[left];
      const r = packet.r + dirObj.r;
      const c = packet.c + dirObj.c;
      packet.d = grid[r][c] === ' ' ? (packet.d + 1) % 4 : left;
    } else if (chr >= 'A' && chr <= 'Z') {
      letters += chr;
    }

    steps++;
  } while (true);

  return [ letters, steps ];
};
