const SimpleGrid = require('../simple-grid');

const DIRECTIONS = [
  { r: -1, c:  0 },
  { r:  0, c: -1 },
  { r:  0, c:  1 },
  { r:  1, c:  0 },
];

/**
 * # [Advent of Code 2022 Day 8](https://adventofcode.com/2022/day/8)
 *
 * My `SimpleGrid` class saved me a bunch of time here, which is good because I lost a lot of time
 * from misreading the rules. Consider the following diagram:
 *
 * ```txt
 * /|\
 * /|\ /|\
 * /|\ /|\ /|\
 * /|\ /|\ /|\
 *  |   |   |
 * -+---+---+--
 *  A   B   C
 * ```
 *
 * In part one, you're outside the grid looking in, standing on the ground. If you are at position
 * A (ignoring the tree there for the moment), you can't see tree C, because tree B is blocking
 * your view. However, in part two you're actually in a tree house at the top of a tree. At
 * position A, tree C is visible, because you're looking down from the top of tree A over the top
 * of tree B. In other words, a tree is visible if all trees between it and your location are
 * shorter than:
 *
 * - **Part one:** ...itself.
 * - **Part two:** ...the tree you're in.
 *
 * I was assuming that **BOTH** visibility rules applied in part two. What was worse was that the
 * example grid given in the puzzle text still produced the right answer for part two when you
 * made this assumption, leading to the bane of AoC participants everywhere: code that works for
 * the example input but not the real one.
 *
 * Anyway, I used `SimpleGrid`'s constructor to parse the input, then `map()` to produce a
 * "visibility map," where each cell contained an object with two properties:
 *
 * - `visible` (`boolean`): Is this tree visible from outside the grid?
 * - `score` (`number`): What's the scenic score from this tree?
 *
 * For any one tree, this result object is computed by iterating the trees in each direction away
 * from the tree, counting trees as I go, and stopping upon reaching a tree as tall or taller than
 * the tree being considered. Multiplying the tree counts in all four directions gives the scenic
 * score. If I reach any edge of the grid without being stopped by a tree, that tree is visible
 * from outside the grid.
 *
 * Once the entire grid has been computed, part one is found by counting the number of visible
 * trees, while the answer to part two is the maximum scenic score of any tree in the grid. The
 * `count()` and `reduce()` methods in `SimpleGrid` made this easy.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input, coerce: Number });

  /**
   * Determines whether the named coordinates are in bounds on the grid.
   *
   * @param {number} r - the row coordinate
   * @param {number} c - the column coordinate
   * @returns {boolean} - whether the coordinates are in bounds
   */
  const inBounds = (r, c) => r >= 0 && r < grid.rows && c >= 0 && c < grid.cols;

  /**
   * Computes the results for a single tree in the grid.
   *
   * @param {number} height - the tree's height
   * @param {number} r - the tree's row coordinate
   * @param {number} c - the tree's column coordinate
   * @returns {Object} - the result object for the tree
   */
  const compute = (height, r, c) => {
    return DIRECTIONS.reduce((result, dir) => {
      let rCur = r + dir.r;
      let cCur = c + dir.c;
      let visibleFromDirection = true;
      let treeCount = 0;

      while (inBounds(rCur, cCur)) {
        treeCount++;

        if (height <= grid.get(rCur, cCur)) {
          // Current tree is at least as tall as this tree:
          // - This tree can't be seen from that direction.
          // - Won't be able to see any more trees in this direction.
          visibleFromDirection = false;
          break;
        }

        rCur += dir.r;
        cCur += dir.c;
      }

      result.visible = result.visible || visibleFromDirection;
      result.score *= treeCount;
      return result;
    }, { visible: false, score: 1 });
  };

  const visibilityMap = grid.map(compute);
  const visibleTrees = visibilityMap.count(cell => cell.visible);
  const maxScenicScore = visibilityMap.reduce((max, { score }) => Math.max(max, score), 0);
  return [ visibleTrees, maxScenicScore ];
};
