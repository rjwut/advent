const { parseGrid } = require('../util');

/**
 * # [Advent of Code 2021 Day 25](https://adventofcode.com/2021/day/25)
 *
 * My implementation is pretty straightforward. There are only a couple of
 * things to note:
 *
 * - You have to move the east-facing sea cucumbers first, before considering
 *   the south-facing ones. Otherwise, the east-facing ones will be in the
 *   wrong locations when considering whether or not to move the south-facing
 *   ones.
 * - For each direction of sea cucumber, you must note whether or not each one
 *   is going to move _before_ you actually move them. For example, if you have
 *   two sea cucumbers on the same row, `A` at column 0 and `B` at column
 *   {max}, `B` should not move because `A` is occupying its destination. But
 *   you iterate the columns and move `A`, it will no longer be in column `0`,
 *   and `B` will move when it shouldn't. 
 *
 * The `step()` function performs a single iteration of the simulation. It
 * returns a boolean indicating whether any sea cucumbers move. I simply keep
 * calling it until it returns `false`, then return the number of iterations
 * performed.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let map = parseGrid(input);
  let moved;
  let steps = 0;

  // eslint-disable-next-line no-unused-vars
  const toString = map => map.map(row => row.join('')).join('\n');

  do {
    moved = step(map);
    steps++;
  } while (moved);

  return [ steps, undefined ];
};

/**
 * Performs a single step of the simulation.
 *
 * @param {Array} map - the map of sea cucumbers 
 * @returns {boolean} - whether any sea cucumbers moved
 */
const step = map => {
  const width = map[0].length;
  const height = map.length;
  let moved = false;
  let toMove = [];

  // Note where the east-facing sea cucumbers will move.
  for (let r = 0; r < height; r++) {
    const row = map[r];

    for (let c = 0; c < width; c++) {
      const cell = row[c];

      if (cell !== '>') {
        continue;
      }

      const c1 = (c + 1) % width;

      if (row[c1] === '.') {
        toMove.push( { r, c, c1 });
        moved = true;
      }
    }
  }

  // Move the east-facing sea cucumbers.
  toMove.forEach(({ r, c, c1 }) => {
    const row = map[r];
    row[c] = '.';
    row[c1] = '>';
  });

  // Note where the south-facing sea cucumbers will move.
  toMove = [];

  for (let r = 0; r < height; r++) {
    const row = map[r];

    for (let c = 0; c < width; c++) {
      const cell = row[c];

      if (cell !== 'v') {
        continue;
      }

      const r1 = (r + 1) % height;

      if (map[r1][c] === '.') {
        toMove.push({ r, c, r1 });
        moved = true;
      }
    }
  }

  // Move the south-facing sea cucumbers.
  toMove.forEach(({ r, c, r1 }) => {
    map[r][c] = '.';
    map[r1][c] = 'v';
  });

  return moved;
};
