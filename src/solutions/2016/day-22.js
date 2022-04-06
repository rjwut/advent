const { match } = require('../util');

const NODE_REGEXP = /\/dev\/grid\/node-x(?<x>\d+)-y(?<y>\d+)\s+(?<total>\d+)T\s+(?<used>\d+)T\s+(?<avail>\d+)T/g;
const WALL_THRESHOLD = 100;

/**
 * # [Advent of Code 2016 Day 22](https://adventofcode.com/2016/day/22)
 *
 * Part one is pretty straightforward: after parsing the input, just compare
 * every node with every other node, and if node A is not empty and node B's
 * free space is greater than or equal to node A's used space, count that as a
 * viable pair.
 *
 * Part two becomes simpler when you inspect the list of viable pairs from part
 * one:
 *
 * - Node B for each pair is always the same, empty node. (In fact, that node
 *   is the only one that is empty.) In other words, there is no way to move
 *   data from any node into the free space of any non-empty node.
 * - There are some nodes that are not mentioned at all in the list of viable
 *   pairs. Inspecting these nodes in the source data reveals that they are
 *   substantially larger than the others, and contain more data than would
 *   ever fit in other nodes. Since they can't be moved, these nodes are
 *   essentially "walls" that the target data can't pass through.
 * - All "wall" nodes have a size of `100` or more, while all non-wall nodes
 *   have sizes less than that.
 *
 * Thus, every node contains either nothing, data that could be moved into an
 * adjacent empty node, or immovable data. With only one empty node, this then
 * becomes similar to a [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle),
 * where the movable data are like tiles. We move them around to get the empty
 * space over to where the target data is located, then work that tile over to
 * `(0, 0)`. The "wall" nodes are obstacles that must be circumvented.
 *
 * Below is a render of the grid using my data set
 *
 * ```txt
 * O...............................T
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .################################
 * ............E....................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * .................................
 * ```
 *
 * Legend:
 *
 * - `O`: origin node (accessible)
 * - `T`: target node (where the data we want is located)
 * - `E`: empty node
 * - `#`: "wall" node
 * - `.`: "tile" node
 *
 * As it turns out, all the inputs look similar to this: a big horizontal wall
 * at `y > 1`, with an opening on the left side, and with the one empty space
 * node somewhere below it. So the strategy is as follows:
 *
 * 1. Move the empty space to the column to the left of the left edge of the
 *    wall.
 * 2. Move it to the top row.
 * 3. Move it to the rightmost column. This moves the target data one column to
 *    the left.
 * 4. Repeat these steps until the target data arrives at the origin:
 *    1. Move the empty space down one row.
 *    2. Move it left two columns.
 *    3. Move it up one row.
 *    4. Move it right one column.
 *
 * To accomplish this, we need to know following locations:
 *
 * - Origin node: `(0, 0)`
 * - Target node: `(xMax, 0)`, `(32, 0)` in my data set
 * - Leftmost wall node: `(xWall, yWall)`, `(1, 13)` in my data set
 * - Empty node: `(xEmpty, yEmpty)`, `(12, 14)` in my data set
 *
 * We compute the number of moves as follows:
 *
 * - Moving to left edge of wall: `xEmpty - xWall + 1`
 * - Moving to top row: `yEmpty`
 * - Moving to rightmost column: `xMax - xWall + 1`
 * - Shifting data to left: `(xMax - 1) * 5`
 *
 * Add these together to get the total number of moves, which is the answer to
 * part two. For my input, that's:
 *
 * ```txt
 * (12 - 1 + 1) + 14 + (32 - 1 + 1) + (32 - 1) * 5 = 213
 * ```
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the puzzle part to solve
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const nodes = match(input, NODE_REGEXP, {
    x: Number,
    y: Number,
    total: Number,
    used: Number,
    avail: Number,
  });
  const parts = [ countViablePairs, countSteps ];

  if (part !== undefined) {
    return parts[part - 1](nodes);
  }

  return parts.map(part => part(nodes));
};

/**
 * Returns the number of viable pairs of nodes, as requested for part one.
 *
 * @param {Array} nodes - the parsed nodes
 * @returns {number} - the answer to part one
 */
const countViablePairs = nodes => {
  let count = 0;
  nodes.forEach(nodeA => {
    nodes.forEach(nodeB => {
      if (nodeA !== nodeB && nodeA.used && nodeB.avail >= nodeA.used) {
        count++;
      }
    })
  })
  return count;
};

/**
 * Returns the number of steps to move the data to the origin, as requested for
 * part two.
 *
 * @param {Array} nodes - the parsed nodes
 * @returns {number} - the answer to part two
 */
const countSteps = nodes => {
  const pois = findPois(nodes);
  return pois.empty.x - pois.wall.x + 1 + // move past left edge of wall
    pois.empty.y +                        // move all the way up
    pois.xMax - pois.wall.x + 1 +         // move all the way right
    (pois.xMax - 1) * 5;                  // shift data all the way left
};

/**
 * Examines the given nodes to find the "points of interest":
 *
 * - `xMax` (number): The largest X coordinate of any node
 * - `wall` (object): The coordinates of the leftmost wall node
 * - `empty` (object): The coordinates of the empty node
 * @param {Array} nodes - the parsed nodes
 * @returns {Object} - the points of interest object
 */
const findPois = nodes => {
  const pois = {
    xMax: -Infinity,
    wall: null,
    empty: null,
  };

  for (const node of nodes) {
    pois.xMax = Math.max(pois.xMax, node.x);

    if (node.used === 0) {
      pois.empty = { x: node.x, y: node.y };
    } else if (node.used >= WALL_THRESHOLD) {
      if (pois.wall === null) {
        pois.wall = { x: node.x, y: node.y };
      } else {
        pois.wall.x = Math.min(pois.wall.x, node.x);
      }
    }
  }

  return pois;
};
