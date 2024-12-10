const SimpleGrid = require('../simple-grid');

const DIRECTIONS = [
  { dr: -1, dc:  0 },
  { dr:  0, dc:  1 },
  { dr:  1, dc:  0 },
  { dr:  0, dc: -1 },
];

/**
 * # [Advent of Code 2024 Day 10](https://adventofcode.com/2024/day/10)
 *
 * 1. Parse input into a grid of elevations.
 * 2. Find all trailheads (elevations of 0).
 * 3. For each trailhead, compute its score and rating:
 *    - Create a `Set` of summit coordinates and a `Set` of trails.
 *    - Perform a depth-first search (breadth-first would work, too) to find all trails from the
 *       trailhead to any summit (elevation of 9).
 *    - Each stack entry tracks the current grid coordinates and the trail taken to reach that
 *      point. (I'm also storing the current elevation for convenience, but that's not required,
 *      since you can retrieve it from the grid.)
 *    - Prune any branch where elevation does not increase by exactly 1.
 *    - Make sure not to leave the grid bounds.
 *    - Upon reaching a summit, convert its coordinates into a string and insert it into the summit
 *      `Set`. Concatentate the trail coordinates into a string and insert it into the trail `Set`.
 *    - When the search is complete, the trailhead's score is the size of the summit `Set`, and its
 *      rating is the size of the trail `Set`.
 * 4. Sum together all trailhead scores for the answer to part 1, and all trailhead ratings for the
 *    answer to part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input }).map(chr => Number(chr));
  const trailheads = grid
    .findAll(elevation => elevation === 0)
    .map(({ r, c }) => ({ r, c }));
  const scores = [ 0, 0 ];
  trailheads.forEach(trailhead => {
    const { summits, trails } = evaluateTrailhead(grid, trailhead);
    scores[0] += summits;
    scores[1] += trails;
  });
  return scores;
};

/**
 * Determines the score and rating for this trailhead.
 *
 * @param {SimpleGrid} grid - the topographic map
 * @param {Object} coords - the coordinates of the trailhead
 * @param {number} coords.r - the row coordinate
 * @param {number} coords.c - the column coordinate
 * @returns {Object} - the `score` and `rating` for the trailhead
 */
const evaluateTrailhead = (grid, { r, c }) => {
  const stack = [ { r, c, elevation: 0, trail: [] } ];
  const summits = new Set();
  const trails = new Set();

  do { // depth-first search
    const { r, c, elevation, trail } = stack.pop();
    DIRECTIONS.forEach(({ dr, dc }) => {
      const nr = r + dr;
      const nc = c + dc;
      const nElevation = elevation + 1;

      if (!grid.inBounds(nr, nc) || grid.get(nr, nc) !== nElevation) {
        return; // coordinate is out of bounds or is not an elevation increase of 1; prune branch
      }

      const nTrail = [ ...trail, `${nr},${nc}` ];

      if (nElevation === 9) {
        // We've reached a summit; store the summit location and trail taken to reach it
        summits.add(`${nr},${nc}`);
        trails.add(nTrail.join(' '));
      } else {
        stack.push({ r: nr, c: nc, elevation: nElevation, trail: nTrail });
      }
    });
  } while (stack.length);

  return { summits: summits.size, trails: trails.size };
};
