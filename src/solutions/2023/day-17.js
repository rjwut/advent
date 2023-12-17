const SimpleGrid = require('../simple-grid');
const aStar = require('../a-star');

const Directions = [
  { dr: -1, dc:  0 },
  { dr:  1, dc:  0 },
  { dr:  0, dc:  1 },
  { dr:  0, dc: -1 },
];
const Opposites = [ 1, 0, 3, 2 ];

const BlockLimits = [
  { canTurnOrStopAfter: 0, canGoStraightUntil: 3 },
  { canTurnOrStopAfter: 4, canGoStraightUntil: 10 },
];

/**
 * # [Advent of Code 2023 Day 17](https://adventofcode.com/2023/day/17)
 *
 * @todo Describe solution
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input }).map(Number);

  const edgeFn = (node, { canTurnOrStopAfter, canGoStraightUntil }) => {
    const [ r, c, dirIndex, blocksInDir ] = node.split(',').map(Number);
    const edges = [];
    Directions.forEach(({ dr, dc }, nextDirIndex) => {
      if (nextDirIndex === Opposites[dirIndex]) {
        return; // can't go back the way we came
      }

      if (nextDirIndex === dirIndex) {
        if (blocksInDir === canGoStraightUntil) {
          return; // can't keep going straight
        }
      } else if (blocksInDir < canTurnOrStopAfter && dirIndex !== -1) {
        return; // can't turn
      }

      const nextR = r + dr;
      const nextC = c + dc;

      if (!grid.inBounds(nextR, nextC)) {
        return; // can't leave the grid
      }

      const nextStepsInDir = dirIndex === nextDirIndex ? blocksInDir + 1 : 1;
      const node = `${nextR},${nextC},${nextDirIndex},${nextStepsInDir}`;
      const cost = grid.get(nextR, nextC);
      edges.push({ node, cost });
    });
    return edges;
  };

  return BlockLimits.map(dirTest => {
    const goalFn = node => {
      const [ r, c, , blocksInDir ] = node.split(',').map(Number);
      return r === grid.rows - 1 && c === grid.cols - 1 && dirTest.canTurnOrStopAfter <= blocksInDir;
    };
    return aStar(
      '0,0,-1,0',
      goalFn,
      node => edgeFn(node, dirTest)
    ).cost;
  });
};
