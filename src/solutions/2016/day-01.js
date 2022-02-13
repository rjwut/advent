const { split } = require('../util');

const DIRECTIONS = [
  [ -1,  0 ], // north
  [  0,  1 ], // east
  [  1,  0 ], // south
  [  0, -1 ], // west
];

/**
 * # [Advent of Code 2016 Day 1](https://adventofcode.com/2016/day/1)
 *
 * Both parts of the puzzle can be solved in a single pass. We keep string
 * representations of visited coordinates in a `Set`, and when we encounter one
 * that's already in the `Set`, the distance to that point is the answer to
 * part two. Then we continue until we get to the end of the instructions, and
 * the distance to that point is the answer to part one.
 *
 * Direction is stored as an index into the `DIRECTIONS` array. Adding `1` to
 * the direction index turns right; adding `3` turns left (modulo 4).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const directions = split(input, { delimiter: ', ' })
    .map(part => ({
      turn: part.charAt(0) === 'L' ? 3 : 1,
      distance: parseInt(part.substr(1), 10),
    }));
  const visited = new Set();
  const coords = [ 0, 0 ];
  let dir = 0;
  const answers = new Array(2);
  directions.forEach(next => {
    dir = (dir + next.turn) % 4;
    const delta = DIRECTIONS[dir];

    for (let i = 0; i < next.distance; i++) {
      for (let j = 0; j < 2; j++) {
        coords[j] += delta[j];
      }

      const key = coords.join(',');

      if (!answers[1] && visited.has(key)) {
        answers[1] = Math.abs(coords[0]) + Math.abs(coords[1]);
      }

      visited.add(key);
    }
  });
  answers[0] = Math.abs(coords[0]) + Math.abs(coords[1]);
  return answers;
};
