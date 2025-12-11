const { match } = require('../util');
const SimpleGrid = require('../simple-grid');
const aStar = require('../a-star');
const { manhattanDistance } = require('../math2');

const BYTE_REGEXP = /^(?<c>\d+),(?<r>\d+)$/gm;
const DIRECTIONS = [
  [  0,  1 ],
  [  0, -1 ],
  [  1,  0 ],
  [ -1,  0 ],
];

/**
 * # [Advent of Code 2024 Day 18](https://adventofcode.com/2024/day/18)
 *
 * This was quite the breather after the previous two puzzles! Fortunately, I already had utilities
 * that handled most of the work on this one.
 *
 * ## Part 1
 *
 * We have to compute the length of the shortest safe path through the grid after 1024 bytes
 * (obstacles) have been placed in the grid. So after parsing the input, we simply create an empty
 * grid of the correct size and iterate the first 1024 sets of coordinates in the input, marking the
 * corresponding cell for each one as blocked. Then we can use the
 * [A* algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm) to find the best path through.
 * The heuristic function is just the Manhattan distance from the current node to the goal.
 *
 * ## Part 2
 *
 * Now we have to detect which byte's placement causes the path to the goal to be blocked. We simply
 * continue to iterate where we left off, but we recompute the path after each byte until A*
 * reports that no path exists. As soon as that happens, the coordinates of the last byte placed are
 * the answer.
 *
 * Note that `SimpleGrid` works in terms of rows and columns, while the puzzle uses X,Y. This caused
 * nearly 10 minutes of head scratching for me, since I couldn't figure out what was wrong with my
 * part two answer until I realized I had the coordinates swapped!
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, size = 71, part1Bytes = 1024) => {
  const goal = [ size - 1, size - 1 ];

  /**
   * Produces the edges from the given node for use by A*.
   *
   * @param {string} node - the coordinates to the node as a string in `r,c` format
   * @returns {Object[]} - the edges from the given node
   */
  const getEdges = node => {
    const [ r, c ] = node.split(',').map(Number);
    const edges = [];
    DIRECTIONS.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;

      if (!grid.inBounds(nr, nc)) {
        return;
      }

      if (grid.get(nr, nc) !== '#') {
        edges.push({ node: `${nr},${nc}` });
      }
    });
    return edges;
  };

  /**
   * Computes the A* heuristic.
   *
   * @param {string} node - the current node
   * @returns {number} - the Manhattan distance to the goal from the current node
   */
  const heuristic = node => manhattanDistance(
    node.split(',').map(Number),
    goal
  );

  // Parse the input and set up the grid
  const bytes = match(input, BYTE_REGEXP, { r: Number, c: Number });
  const grid = new SimpleGrid({ rows: size, cols: size, fill: '.' });
  let i = 0, cost, lastByte;

  // Drop all the bytes for part 1
  for (; i < part1Bytes; i++) {
    const byte = bytes[i];
    grid.set(byte.r, byte.c, '#');
  }

  // Compute the answer to part one: the length of the shortest path after 1024 bytes have dropped.
  const part1 = aStar(
    '0,0',
    goal.join(','),
    getEdges,
    heuristic
  ).cost;

  // Continue dropping bytes until the path is blocked
  do {
    lastByte = bytes[i++];
    grid.set(lastByte.r, lastByte.c, '#');
    cost = aStar(
      '0,0',
      goal.join(','),
      getEdges,
      heuristic
    )?.cost;
  } while (cost);

  return [ part1, `${lastByte.c},${lastByte.r}` ];
};
