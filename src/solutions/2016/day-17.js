const crypto = require('crypto');

const DIRECTIONS = [
  { d: 'U', x: 0, y: -1 },
  { d: 'D', x: 0, y: 1 },
  { d: 'L', x: -1, y: 0 },
  { d: 'R', x: 1, y: 0 },
];

/**
 * # [Advent of Code 2016 Day 17](https://adventofcode.com/2016/day/17)
 *
 * By performing a breadth-first search and pushing each path we find onto an
 * array, we ensure that the zeroeth path in that array is the shortest, and
 * the last one is the longest. That's all there really is to this puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  const queue = [ { path: '', x: 0, y: 0 } ];
  const paths = [];

  do {
    const { path, x, y } = queue.shift();
    const hashAlgo = crypto.createHash('md5');
    hashAlgo.update(input + path);
    const hash = hashAlgo.digest('hex');

    for (let i = 0; i < 4; i++) {
      const chr = hash[i];

      if (chr < 'b') {
        continue; // This door is closed
      }

      const dir = DIRECTIONS[i];
      const x1 = x + dir.x;
      const y1 = y + dir.y;

      if (x1 < 0 || x1 > 3 || y1 < 0 || y1 > 3) {
        continue; // Can't go outside the 4 x 4 grid
      }

      const newPath = path + dir.d;

      if (x1 === 3 && y1 === 3) {
        // Found a path!
        paths.push(newPath);
        continue;
      }

      queue.push({ path: newPath, x: x1, y: y1 });
    }
  } while (queue.length);

  if (paths.length) {
    return [ paths[0], paths[paths.length - 1].length ];
  }

  return [ undefined, undefined ];
};
