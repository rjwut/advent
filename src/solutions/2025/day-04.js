const SimpleGrid = require('../simple-grid');

/**
 * # [Advent of Code 2025 Day 4](https://adventofcode.com/2025/day/4)
 *
 * 1. Create a copy of the grid that replaces each `.` with `null` and each `@` with the number of
 *    adjacent `@` cells. Count the number of `@` cells with fewer than 4 adjacent `@` cells for the
 *    answer to part 1.
 * 2. Repeatedly iterate the grid, replacing each cell containing a value less than 4 with `null`
 *    and decrementing the counts in adjacent cells. Count the number of cells removed in each pass,
 *    and sum these for the answer to part 2. Stop when a pass removes no cells.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  // Parse the grid
  let part1 = 0;
  let grid = new SimpleGrid({ data: input });

  // Populate a copy of the grid with adjacent roll counts.
  // Count how many are less than 4 for the answer to part 1.
  grid = grid.map((v0, r, c) => {
    if (v0 === '.') {
      return null;
    }

    let adjacentCount = 0;
    grid.forEachNear(r, c, v1 => {
      adjacentCount += v1 === '@' ? 1 : 0;
    });
    part1 += adjacentCount < 4 ? 1 : 0;
    return adjacentCount;
  });

  // Repeatedly remove cells with fewer than 4 adjacent rolls and decrement their neighbors.
  // Continue until no more can be removed.
  // Sum how many were removed in each pass for the answer to part 2.
  let part2 = 0;

  do {
    const removed = remove(grid);

    if (removed === 0) {
      break;
    }

    part2 += removed;
  } while (true);
  return [ part1, part2 ];
};

/**
 * Performs a single pass on the grid, removing all eligible rolls and decrementing their neighbors.
 *
 * @param {SimpleGrid} grid - the `SimpleGrid` instance to process
 * @returns {number} - the number of cells removed in this pass
 */
const remove = grid => {
  let removed = 0;
  grid.forEach((v, r, c) => {
    if (v === null || v > 3) {
      return;
    }

    grid.set(r, c, null);
    grid.forEachNear(r, c, (v1, r1, c1) => {
      if (v1 !== null) {
        grid.set(r1, c1, v1 - 1);
      }
    });
    removed++;
  });
  return removed;
};
