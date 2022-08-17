const InfiniteGrid = require('../infinite-grid');

const DIRECTIONS = {
  '^': [  0, -1 ],
  '>': [  1,  0 ],
  'v': [  0,  1 ],
  '<': [ -1,  0 ],
};

/**
 * # [Advent of Code 2015 Day 3](https://adventofcode.com/2015/day/3)
 *
 * Both parts can be solved with the same code, given the input and the number
 * of deliverers. Since we don't know how large the bounds of the traveled area
 * will be, I use the `InfiniteGrid` class I wrote to track how many times each
 * house is visited.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  return [ 1, 2 ].map(delivererCount => deliver(input, delivererCount));
};

/**
 * Determines how many houses get visited, given the directions and the number
 * of deliverers.
 *
 * @param {string} directions - the puzzle input (the "eggnogged" directions)
 * @param {number} delivererCount - the number of entities delivering presents
 * @returns {number} - the number of houses visited
 */
const deliver = (directions, delivererCount) => {
  const deliverers = new Array(delivererCount);

  for (let i = 0; i < delivererCount; i++) {
    deliverers[i] = [ 0, 0 ];
  }

  const grid = new InfiniteGrid();
  grid.put([ 0, 0 ], delivererCount);
  [ ...directions ].forEach((dir, i) => {
    const delta = DIRECTIONS[dir];
    const coords = deliverers[i % delivererCount];
    delta.forEach((coordDelta, j) => {
      coords[j] += coordDelta;
    });
    grid.put(coords, (grid.get(coords) ?? 0) + 1);
  });

  return grid.size;
};
