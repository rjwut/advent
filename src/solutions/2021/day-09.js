const { parseGrid } = require('../util');

const DIRECTIONS = [
  { r: -1, c:  0 },
  { r:  1, c:  0 },
  { r:  0, c: -1 },
  { r:  0, c:  1 },
];
const BASIN_SORT = (a, b) => b.size - a.size;

/**
 * # [Advent of Code 2021 Day 9](https://adventofcode.com/2021/day/9)
 *
 * Here is the algorithm I used to compute the basins:
 *
 * 1. Create an empty basin array.
 * 2. Create an empty cache grid the same size as the hightmap.
 * 3. Iterate the heightmap and compute the basin for each cell (see below).
 * 4. Each time a basin is found, increment its size.
 *
 * Computing the basin for a cell is done as follows:
 *
 * 1. Check the cache grid for this cell. If it already has a basin, return it.
 * 2. If the cell's height is 9, return `undefined`. (This is a cave wall.)
 * 3. Compute the direction in which smoke will flow from this cell (toward the
 *    lowest adjacent cell).
 * 4. If all adjacent cells are higher than this cell, we've found a low point.
 *    Create a new basin, compute its risk level, add it to the basin array and
 *    the cache for this cell, and return it.
 * 5. Otherwise, recurse with the cell in the direction of the smoke flow. Add
 *    the basin returned from the recursion to the cache for this cell, and
 *    return it.
 *
 * The cache grid is used to avoid recomputing the basin for the same cell over
 * and over. Once a basin is found for a cell, any time we encounter that cell
 * again while computing smoke flow, we already know what basin it will end up
 * in, so we can just stop there and use the cached reference.
 *
 * Once all basins are computed, they will be found in the basin array. For
 * part one, we just sum their risk levels. For part two, we sort the basins by
 * size, then compute the product of the largest three.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const basins = computeBasins(input);
  return [ part1(basins), part2(basins) ];
};

/**
 * Parses the input into a grid of numbers.
 *
 * @param {string} input - the puzzle input 
 * @returns {Array} - a two-dimensional array representing the heightmap
 */
const parse = input => {
  return parseGrid(input).map(row => {
    return row.map(cell => parseInt(cell, 10));
  });
};

/**
 * Computes all the basins from the heightmap. Each basin is an object with two
 * properties:
 * 
 * - `riskLevel`: the height of the basin's low point plus one
 * - `size`: the number of cells in the basin
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - an array of basins
 */
const computeBasins = input => {
  const grid = parse(input);
  const basins = [];
  const cellTargets = new Array(grid.length);
  const width = grid[0].length;

  for (let r = 0; r < grid.length; r++) {
    cellTargets[r] = new Array(width);
  }

  /**
   * Recursively computes the basin to which a cell belongs.
   *
   * @param {number} r - the cell row
   * @param {number} c - the cell column
   * @returns {Object} - the basin to which the cell belongs, or `undefined` if
   * the cell is part of the cave wall
   */
  const computeBasin = (r, c) => {
    let basin = cellTargets[r][c];

    if (!basin) {
      if (grid[r][c] === 9) {
        // Cave wall
        return;
      }

      const dir = getDirection(grid, r, c);

      if (dir === null) {
        // Found new basin
        basin = {
          riskLevel: grid[r][c] + 1,
          size: 0,
        };
        basins.push(basin);
      } else {
        // Found direction
        basin = computeBasin(r + dir.r, c + dir.c);
      }

      cellTargets[r][c] = basin;
    }

    return basin;
  };

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];

    for (let c = 0; c < row.length; c++) {
      const basin = computeBasin(r, c);

      if (basin) {
        basin.size++;
      }
    }
  }

  return basins.sort(BASIN_SORT);
};

/**
 * Returns the sums of the basin risk levels.
 *
 * @param {Array} basins - the basin array 
 * @returns {number} - the sum of the basin risk levels
 */
 const part1 = basins => basins.reduce((sum, basin) => {
  return sum + basin.riskLevel;
}, 0);

/**
 * Returns the product of the sizes of the largest three basins.
 *
 * @param {Array} basins - the basin array
 * @returns {number} - the product of the sizes of the largest three basins
 */
const part2 = basins => basins.slice(0, 3).reduce((product, basin) => {
  return product * basin.size;
}, 1);

/**
 * Returns the direction of smoke flow from the given cell. Assumes the cell is
 * not a `9`. The direction is represented by an object with `r` and `c`
 * properties giving the relative direction along each axis.
 *
 * @param {Array} grid - the heightmap 
 * @param {number} r - the row of the cell 
 * @param {number} c - the column of the cell 
 * @returns {Object} - the direction of smoke flow, or `null` if the cell is a
 * low point
 */
const getDirection = (grid, r, c) => {
  const height = grid[r][c];

  return DIRECTIONS.reduce((result, curDir) => {
    const r1 = r + curDir.r;
    const c1 = c + curDir.c;

    if (r1 < 0 || r1 >= grid.length || c1 < 0 || c1 >= grid[r1].length) {
      return result;
    }

    const adjHeight = grid[r1][c1];

    if (adjHeight < height && adjHeight < result.height) {
      result.height = adjHeight;
      result.dir = curDir;
    }

    return result;
  }, { height: Infinity, dir: null }).dir;
};
