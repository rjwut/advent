const SimpleGrid = require('../simple-grid');
const { add } = require('../math2');

/**
 * # [Advent of Code 2023 Day 13](https://adventofcode.com/2023/day/13)
 *
 * ## Detecting a Reflection
 *
 * A reflection line has a type (either (`r`)ow or (`c`)olumn), and a value (the row below the line
 * or the column to the right of the line). In this example, we'll use the row type, but the column
 * type works the same way.
 *
 * First, we make a set of all candidate reflection rows, which is all of them except row `0`,
 * since a reflection line must have at least one row on each side to reflect. We then iterate the
 * columns, determining whether each of the candidates is a valid reflection line for that column.
 * This is done by comparing the cells just above and below the reflection line, then if they match,
 * the next cells above and below those, and so on until they don't match or we hit the edge of the
 * grid. If any cell comparisons don't match, that row is removed from the candidate set. This
 * continues as long as we have at least one candidate row and there are more columns to check.
 *
 * If all candidate rows are eliminated, then we follow the same process to search for a vertical
 * reflection line instead. In part one, there will be exactly one reflection line. In part two,
 * there will be a new reflection line that must be found, but the old one may still be present and
 * should be ignored. To do this, we simply accept an optional `ignore` parameter for the function
 * that searches for a reflection line. If the `ignore` parameter is provided, then we omit that
 * row/column from the candidate set before we start searcing.
 *
 * In part two, we must determine the location of the smudge. We do this by iterating the cells in
 * the grid and changing each one to the opposite value. Then we search for a reflection line
 * again, ignoring the line from the part one. If we find a new reflection line, then we know that
 * the smudge is in that cell, and we can use the new reflection line for the answer. Otherwise, we
 * restore the cell to its original value and continue searching.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grids = input.split('\n\n')
    .map(grid => new SimpleGrid({ data: grid }));
  const reflections1 = grids.map(grid => findReflection(grid));
  const reflections2 = grids.map((grid, i) => fixSmudge(grid, reflections1[i]));
  return [ reflections1, reflections2 ].map(reflections => {
    const buckets = reflections.reduce((buckets, reflection) => {
      buckets[reflection.type].push(reflection.value);
      return buckets;
    }, { r: [], c: [] });
    return add(buckets.r) * 100 + add(buckets.c);
  });
};

/**
 * Searches for a reflection line in the given `SimpleGrid`.
 *
 * @param {SimpleGrid} grid - the grid to search
 * @param {Object} ignore - the reflection line from part one to ignore
 * @returns {Object} - the found reflection line
 */
const findReflection = (grid, ignore) => findReflectionRow(grid, ignore) ?? findReflectionCol(grid, ignore);

/**
 * Determines where the smudge on the mirror is located, then returns the new reflection line
 * resulting from fixing the smudge.
 *
 * @param {SimpleGrid} grid - the grid to search
 * @param {Object} ignore - the reflection line from part one to ignore
 * @returns {Object} - the found reflection line
 */
const fixSmudge = (grid, ignore) => {
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const original = grid.get(r, c);
      grid.set(r, c, original === '#' ? '.' : '#');
      const reflection = findReflection(grid, ignore);

      if (reflection) {
        return reflection;
      }

      grid.set(r, c, original);
    }
  }

  return null;
};

/**
 * Searches the grid for a horizontal reflection line.
 *
 * @param {SimpleGrid} grid - the grid to search
 * @param {Object} ignore - the reflection line from part one to ignore
 * @returns {Object|null} - the found reflection line, or `null` if no horizontal reflection line
 * is found
 */
const findReflectionRow = (grid, ignore) => {
  const candidateRows = new Set();

  for (let r = 1; r < grid.rows; r++) {
    if (ignore?.type !== 'r' || ignore.value !== r) {
      candidateRows.add(r);
    }
  }

  for (let c = 0; candidateRows.size && c < grid.cols; c++) {
    [ ...candidateRows ].forEach(r => {
      let ra = r - 1, rb = r;

      while (ra >= 0 && rb < grid.rows) {
        if (grid.get(ra, c) !== grid.get(rb, c)) {
          candidateRows.delete(r);
          break;
        }

        ra--;
        rb++;
      }
    });
  }

  return candidateRows.size === 1 ? { type: 'r', value: [ ...candidateRows ][0] } : null;
};

/**
 * Searches the grid for a vertical reflection line.
 *
 * @param {SimpleGrid} grid - the grid to search
 * @param {Object} ignore - the reflection line from part one to ignore
 * @returns {Object|null} - the found reflection line, or `null` if no vertical reflection line is
 * found
 */
const findReflectionCol = (grid, ignore) => {
  const candidateCols = new Set();

  for (let c = 1; c < grid.cols; c++) {
    if (ignore?.type !== 'c' || ignore.value !== c) {
      candidateCols.add(c);
    }
  }

  for (let r = 0; candidateCols.size && r < grid.rows; r++) {
    [ ...candidateCols ].forEach(c => {
      let ca = c - 1, cb = c;

      while (ca >= 0 && cb < grid.cols) {
        if (grid.get(r, ca) !== grid.get(r, cb)) {
          candidateCols.delete(c);
          break;
        }

        ca--;
        cb++;
      }
    });
  }

  return candidateCols.size === 1 ? { type: 'c', value: [ ...candidateCols ][0] } : null;
};
