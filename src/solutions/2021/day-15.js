const { grid: newGrid, parseGrid } = require('../util');

const DIRECTIONS = [
  [ -1, 0 ],
  [ 0, -1 ],
  [ 0, 1 ],
  [ 1, 0 ],
];

/**
 * # [Advent of Code 2021 Day 15](https://adventofcode.com/2021/day/15)
 *
 * Both parts of the puzzle require us find the path from the top-left corner
 * of a grid to the bottom-right corner that has the least risk. This is
 * basically [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm).
 *
 * For part two, we need to duplicate the grid 24 more times to form a grid
 * that is five times bigger in each direction, with each cell in each
 * duplicate grid having the risk of the corresponding cell in the grid above
 * or to the left of it plus one (wrapping from `9` back to `1`). For any one
 * cell in the large grid, the corresponding cell in the small grid can be
 * computed by taking the modulus of the row and column coordinates against the
 * height and width of the original grid. The amount to increase the risk by is
 * `floor(r / h) + floor(c / w)`. This is then added to the risk in the
 * original cell and wrapped back around to `1` if needed.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const smallGrid = parseGrid(input, { parseInt: true });
  const largeGrid = duplicateGrid(smallGrid, 5);
  return [
    computeMinRisk(smallGrid),
    computeMinRisk(largeGrid),
  ];
};

/**
 * Duplicates a grid so that it is `times` times wider and taller. For each
 * copy of the original grid, each cell's risk is increased by one (wrapping
 * back around to `1` if it passes `9`).
 *
 * @param {Array} grid0 - the original grid
 * @param {number} times - the multiplier for the grid's width and height
 * @returns {Array} - the duplicated grid
 */
const duplicateGrid = (grid0, times) => {
  const h0 = grid0.length;
  const w0 = grid0[0].length;
  const h1 = h0 * times;
  const w1 = w0 * times;
  const grid1 = newGrid(h1, w1, 0);

  for (let r1 = 0; r1 < h1; r1++) {
    for (let c1 = 0; c1 < w1; c1++) {
      const r0 = r1 % h0;
      const c0 = c1 % w0;
      const tileOffset = Math.floor(r1 / h0) + Math.floor(c1 / w0)
      const newValue = grid0[r0][c0] + tileOffset;
      grid1[r1][c1] = newValue > 9 ? newValue - 9 : newValue;
    }
  }

  return grid1;
};

/**
 * Returns the risk of the path from the top-left corner of a grid to the
 * bottom-right corner that has the least risk.
 *
 * @param {Array} grid - the grid
 * @returns {number} - the path risk
 */
const computeMinRisk = grid => {
  return dijkstra(grid)[grid.length - 1][grid[0].length - 1];
};

/**
 * Implementation of Dijkstra's algorithm for finding the minimum risk for
 * reaching each cell in a grid, starting from the top-left corner.
 *
 * @param {Array} grid - the grid with the risk values for each cell
 * @returns {Array} - a copy of the grid with the cumulative risk for each cell
 */
const dijkstra = grid => {
  const height = grid.length;
  const width = grid[0].length;
  const risks = newGrid(width, height, Infinity);
  const stack = [ { r: 0, c: 0, risk: 0 } ];
  risks[0][0] = 0;

  do {
    const entry = stack.shift();

    for (const [ dr, dc ] of DIRECTIONS) {
      const r = entry.r + dr;

      if (r < 0 || r >= height) {
        continue;
      }

      const c = entry.c + dc;

      if (c < 0 || c >= width) {
        continue;
      }

      const risk = risks[entry.r][entry.c] + grid[r][c];

      if (risk < risks[r][c]) {
        risks[r][c] = risk;
        stack.push({ r, c, risk });
      }
    }
  } while (stack.length);

  return risks;
};
