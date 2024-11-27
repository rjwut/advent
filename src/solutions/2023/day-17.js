const SimpleGrid = require('../simple-grid');
const dijkstra = require('../dijkstra');

const Directions = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
];
const Opposites = [ 1, 0, 3, 2 ];
const BlockLimits = [ [ 0, 3 ], [ 4, 10 ] ];

/**
 * # [Advent of Code 2023 Day 17](https://adventofcode.com/2023/day/17
 *
 * The difference between the two parts of the puzzle is the minimum and maximum limits on the
 * number of blocks for each "leg" of the crucible's path. In the first part, the crucible can turn
 * or stop at any time, but must not travel more than three blocks in a straight line. In the
 * second part, the crucible can travel up to 10 blocks in a straight line, but must travel at least
 * four blocks before it can turn or stop. The `BlockLimits` array contains the minimum and maximum
 * block limits for each part of the puzzle, allowing both parts to be computed with the same code.
 *
 * The solution uses [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
 * to pathfind through the grid. Since the direction that a crucible is traveling and how far it
 * has traveled in that leg dictate what directions it can go next, every combination of
 * coordinates, travel direction, and number of blocks traveled in that direction is considered a
 * unique node in the search space. The edge function will exclude edges to an adjacent block if:
 *
 * - It leads back to the previous block (since backtracking isn't allowed)
 * - It leads off the grid
 * - It represents a 90-degree turn or leads to a goal node, and the crucible hasn't traveled the
 *   minimum number of blocks in the current direction yet
 * - It represents continuing in a straight line and the crucible has traveled the maximum number
 *   of blocks in the current direction
 *
 * Since it is possible to arrive at the goal from both the north and the west, and having traveled
 * different numbers of blocks in that direction before arriving, there will be multiple goal nodes
 * all representing the crucible's destination, meaning the algorithm will have produced multiple
 * paths there. So we then filter the results to exclude all nodes that are at other blocks, then
 * find the one with the lowest cost, which is the answer to the puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input }).map(Number);
  return BlockLimits.map(limits => solve(grid, limits));
};

const solve = (grid, [ minRunBlocks, maxRunBlocks ]) => {
  /**
   * Returns the edges connected to the given node in the search space.
   *
   * @param {Object} param0 - the search node
   * @returns {Object[]} - the edges
   */
  const edgeFn = ({ r, c, dirIndex, blocksInDir }) => {
    const edges = [];
    Directions.forEach(({ dr, dc }, nextDirIndex) => {
      if (nextDirIndex === Opposites[ dirIndex ]) {
        return; // can't go back the way we came
      }

      if (nextDirIndex === dirIndex) {
        if (blocksInDir === maxRunBlocks) {
          return; // can't keep going straight
        }
      } else if (blocksInDir < minRunBlocks && dirIndex !== -1) {
        return; // can't turn
      }

      const node = {
        r: r + dr,
        c: c + dc,
        dirIndex: nextDirIndex,
        blocksInDir: dirIndex === nextDirIndex ? blocksInDir + 1 : 1,
      };

      if (!grid.inBounds(node.r, node.c)) {
        return; // can't leave the grid
      }

      if (node.r + 1 === grid.rows && node.c + 1 === grid.cols && node.blocksInDir < minRunBlocks) {
        return; // can't stop at goal; haven't traveled min number of blocks
      }

      edges.push({
        node,
        cost: grid.get(node.r, node.c),
      });
    });

    return edges;
  };

  const startNode = { r: 0, c: 0, dirIndex: -1, blocksInDir: 0 };
  const goalKey = `${grid.rows - 1},${grid.cols - 1},`;
  const goal = (_, key) => key.startsWith(goalKey);
  const costs = dijkstra(startNode, edgeFn, { keyFn, goal });

  // Reduce down to the best goal path
  const [ , bestNode ] = [ ...costs.entries() ]
    .filter(
      ([ key ]) => key.startsWith(goalKey)
    )
    .reduce(
      (best, entry) => entry[1].cost < best[1].cost ? entry : best,
      [ null, { cost: Infinity } ]
    );
  return bestNode.cost;
};


/**
 * Produces the map key for the given node in the search space.
 *
 * @param {Object} node - the search node
 * @returns {string} - the map key
 */
const keyFn = node => `${node.r},${node.c},${node.dirIndex},${node.blocksInDir}`;
