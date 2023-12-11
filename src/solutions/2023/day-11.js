const SimpleGrid = require('../simple-grid');
const { manhattanDistance } = require('../math2');

const EXPANSION = [ 1, 999_999 ];

/**
 * # [Advent of Code 2023 Day 11](https://adventofcode.com/2023/day/11)
 *
 * I can parse the input grid using my `SimpleGrid` class, then use its `findAll()` method to
 * produce the coordinates of each galaxy. Once I have an array of those coordinates, I don't need
 * the grid anymore.
 *
 * To perform the expansion computations, I need to identify which rows and columns are empty. For
 * this, I create an array of booleans for each axis to track the empties. Then I iterate the
 * galaxies and set the corresponding row and column for each one to be non-empty.
 *
 * To perform the expansion, I will need to translate each galaxy by the number of empty rows and
 * columns that precede it times an expansion factor (`1` for part one, `999,999` for part two). So
 * I convert my empty row and column arrays into cumulative sums. Here's the result for part one
 * using the example input:
 *
 * ```txt
 *   0011122233
 * 0 ...#......
 * 0 .......#..
 * 0 #.........
 * 1 ..........
 * 1 ......#...
 * 1 .#........
 * 1 .........#
 * 2 ..........
 * 2 .......#..
 * 2 #...#.....
 * ```
 *
 * Now I can compute the new position for each galaxy by simply adding each of its coordinates to
 * the corresponding cumulative sums. For example, the galaxy located at `(4, 6)` above will be
 * translated to `(5, 8)`.
 *
 * Finally, I use the `manhattanDistance()` in my `math2` module to compute the distance between
 * each pair of galaxies and sum the distances together to get the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });
  const galaxies = grid.findAll(value => value === '#');
  return EXPANSION.map(expansion => {
    const expanded = expand(galaxies, expansion);
    return computeDistances(expanded);
  });
};

/**
 * Expands the galaxies by the given expansion factor.
 *
 * Note that the input and output arrays differ in format. The input array expects the coordinates
 * to be objects with `r` and `c` properties, because this is what is produced by
 * `SimpleGrid.findAll()`. However, the `manhattanDistance()` function that I'll be using later
 * expects coordinates to be arrays of the form `[ r, c ]`. So this function also performs that
 * conversion while it's doing the expansion.
 *
 * @param {Array<Object>} galaxies - the galaxy coordinates before expansion
 * @param {number} expansion - the number of rows/columns to expand each empty row/column by
 * @returns {Array<Array<number>>} - the galaxy coordinates after expansion
 */
const expand = (galaxies, expansion) => {
  // Find the maximum row and column
  const { rMax, cMax } = galaxies.reduce(({ rMax, cMax }, { r, c }) => ({
    rMax: Math.max(rMax, r),
    cMax: Math.max(cMax, c),
  }), { rMax: 0, cMax: 0 });

  // Find the empty rows and columns
  let emptyRows = new Array(rMax + 1).fill(true);
  let emptyCols = new Array(cMax + 1).fill(true);
  galaxies.forEach(({ r, c }) => {
    emptyRows[r] = false;
    emptyCols[c] = false;
  });

  // Compute the cumulative expansion sums
  for (let r = 0; r < emptyRows.length; r++) {
    emptyRows[r] = (r === 0 ? 0 : emptyRows[r - 1]) + (emptyRows[r] ? expansion : 0);
  }

  for (let c = 0; c < emptyCols.length; c++) {
    emptyCols[c] = (c === 0 ? 0 : emptyCols[c - 1]) + (emptyCols[c] ? expansion : 0);
  }

  // Translate the galaxies
  return galaxies.map(({ r, c }) => [ r + emptyRows[r], c + emptyCols[c] ]);
};

/**
 * Compute the distance between every pair of coordinates in the given array, and sum the
 * distances.
 *
 * @param {Array<Array<number>>} galaxies - the galaxy coordinates
 * @returns {number} - the sum of the distances
 */
const computeDistances = galaxies => {
  let sum = 0;

  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      sum += manhattanDistance(galaxies[i], galaxies[j]);
    }
  }

  return sum;
};
