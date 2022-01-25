const { split } = require('../util');

/**
 * # [Advent of Code 2020 Day 11](https://adventofcode.com/2020/day/11)
 *
 * The Day 11 puzzle is a cool sort of cellular automaton similar to
 * [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life),
 * with some differences from the standard game:
 *
 * - Some cells are "dead" and can never be active.
 * - The number of adjacent active cells to determine whether a cell becomes
 *   active or inactive are different.
 * - Part two uses different rules for determining which cells are considered
 *   adjacent.
 *
 * One thing to remember is that we can't modify a seat during a pass, or we
 * will affect the results of other seats. We have to determine the status of
 * each seat in the next step without changing any of them, then change them
 * all at the end. I created an object that allows you to get and set the value
 * for each seat, but the `set()` method writes to a clone of the original
 * grid. Once you're done updating the seats, you can call `finalize()`, which
 * replaces the original grid with the clone, and makes a new clone for writing
 * the next step.
 *
 * I also put in some helper functions:
 *
 * - `inBounds()`: Returns whether the given coordinates are in bounds for the
 *   grid.
 * - `countOccupied()`: Returns how many occupied seats there are.
 * - `toString()`: Returns a string representation of the current grid for
 *   debugging.
 *
 * The aspects that differ between the two parts of the puzzle are:
 *
 * - The method used to count the number of occupied seats visible from a given
 *   location:
 *   - Part one looks at the eight adjacent cells in the grid to look for
 *     occupied seats, just like a normal Conway's Game of Life.
 *   - Part two looks in the eight cardinal and intercardinal directions for
 *     the first seat in that direction.
 * - The maximum number of occupied seats a seated person can see around them
 *   before they vacate the seat:
 *   - In part one, the tolerance is three.
 *   - In part two, it is four.
 *
 * For both parts, unoccupied seats from which no occupied seats are visible
 * will become occupied.
 *
 * Our `runPass()` function accepts a function for counting visible occupied
 * seats and the tolerance level as the rules for running the cellular
 * automaton, and performs a single step, returns a boolean indicacting whether
 * any seats changed. We keep executing `runPass()` until it returns `false`,
 * then we return the number of occupied seats as our puzzle answer.
 *
 * The `runPass()` function is pretty straightforward: for each seat in the
 * grid, we call our visibility function to determine how many occupied seats
 * are visible from that location. If the seat is empty and zero occupied seats
 * are visible, we set that seat to become occupied. If it's occupied and the
 * number of occupied seats visible is greater than the tolerance, we set it to
 * become unoccupied. After the grid has been iterated, we finalize it and
 * return `true` if we changed any seats and `false` if we didn't.
 *
 * Now all that's left is to implement the visibility functions for each part.
 * Part one's function, `countAdjacentOccupied`, iterates the adjacent cells by
 * adding -1, 0, and 1 to each of the current cell's coordinates, checking to
 * see if the resulting coordinates are in bounds, and if so, checking for an
 * occupied seat there. Part two's function, `countVisibleOccupied()`, takes
 * this a step further by continuing to add -1, 0, or 1 to the coordinates as
 * long as it's still in bounds and a section of floor is found instead of a
 * seat.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  return [
    solve(input, countAdjacentOccupied, 3),
    solve(input, countVisibleOccupied, 4),
  ];
};

/**
 * Solves part of the puzzle.
 *
 * @param {string} input - the puzzle input
 * @param {Function} countOccupiedFn - the function that determines how many
 * occupied seats a person sees from a given seat
 * @param {number} tolerance - the maximum number of occupied seats someone
 * can see without vacating their seat
 * @returns {number} - the number of occupied seats when the seating stabilizes
 */
const solve = (input, countOccupiedFn, tolerance) => {
  const grid = parseGrid(input);
  while(runPass(grid, countOccupiedFn, tolerance));
  return grid.countOccupied();
};

/**
 * Parses the input and returns an object which allows reading and writing of
 * grid cells. The object has the following properties:
 * - `rowCount` (number): How many rows the grid has
 * - `colCount` (number): How many columns the grid has
 * - `inBounds(r:number, c:number): Returns a boolean indicating whether the
 *   given coordinates fall inside the grid
 * - `get(r:number, c:number)`: Returns the character stored at the given grid
 *   coordinates
 * - `set(r:number, c:number, chr:string)`: Sets the character at the given
 *   grid coordinates in the grid; does not take effect until `finalize()` is
 *   called
 * - `finalize()`: Applies all the changes made by `set()` to the grid
 * - `countOccupied()`: Returns the number of occupied seats in the grid
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the grid object
 */
 const parseGrid = input => {
  const lines = split(input);
  let cells = [ ...lines.join('') ];
  let next = [ ...cells ];
  const grid = {
    rowCount: lines.length,
    colCount: cells.length / lines.length,
    inBounds: (r, c) => r >= 0 && r < grid.rowCount && c >= 0 && c < grid.colCount,
    get: (r, c) => cells[r * grid.colCount + c],
    set: (r, c, chr) => next[r * grid.colCount + c] = chr,
    finalize: () => {
      cells = next;
      next = [ ...next ];
    },
    countOccupied: () => cells.filter(cell => cell === '#').length,
    toString: () => {
      const lines = [];

      for (let r = 0; r < grid.rowCount; r++) {
        lines.push(cells.slice(r * grid.colCount, (r + 1) * grid.colCount).join(''));
      }

      return lines.join('\n');
    }
  };
  return grid;
};

/**
 * Runs a single pass on the seating grid.
 *
 * @param {Object} grid - the seating grid
 * @param {Function} countOccupiedFn - the function that determines how many
 * occupied seats a person sees from a given seat
 * @param {number} tolerance - the maximum number of occupied seats someone
 * can see without vacating their seat
 * @returns {boolean} - whether any seats changed
 */
const runPass = (grid, countOccupiedFn, tolerance) => {
  let changed = false;

  for (let r = 0; r < grid.rowCount; r++) {
    for (let c = 0; c < grid.colCount; c++) {
      const cell = grid.get(r, c);

      if (cell === '.') {
        continue;
      }

      const occupied = countOccupiedFn(grid, r, c);

      if (cell === 'L' && !occupied) {
        grid.set(r, c, '#');
        changed = true;
      } else if (cell === '#' && occupied > tolerance) {
        grid.set(r, c, 'L');
        changed = true;
      }
    }
  }

  grid.finalize();
  return changed;
};

/**
 * Returns the number of occupied seats adjacent to the given coordinates.
 *
 * @param {Object} grid - the seating grid
 * @param {number} r - the row coordinate
 * @param {number} c - the column coordinate
 * @returns {number} - the number of adjacent occupied seats
 */
const countAdjacentOccupied = (grid, r, c) => {
  const r0 = Math.max(r - 1, 0);
  const r1 = Math.min(r + 1, grid.rowCount - 1);
  const c0 = Math.max(c - 1, 0);
  const c1 = Math.min(c + 1, grid.colCount - 1);
  let occupied = 0;

  for (let curR = r0; curR <= r1; curR++) {
    for (let curC = c0; curC <= c1; curC++) {
      if (curR === r && curC === c) {
        continue;
      }

      if (grid.get(curR, curC) === '#') {
        occupied++;
      }
    }
  }

  return occupied;
};

/**
 * Returns the number of occupied seats visible from the given coordinates in
 * the eight cardinal and intercardinal directions.
 *
 * @param {Object} grid - the seating grid
 * @param {number} r - the row coordinate
 * @param {number} c - the column coordinate
 * @returns {number} - the number of visible occupied seats
 */
 const countVisibleOccupied = (grid, r, c) => {
  let occupied = 0;

  for (let dr = -1; dr < 2; dr++) {
    for (let dc = -1; dc < 2; dc++) {
      if (dr === 0 && dc === 0) {
        continue;
      }

      let curR = r + dr, curC = c + dc;

      while (grid.inBounds(curR, curC)) {
        const cell = grid.get(curR, curC);

        if (cell !== '.') {
          occupied += cell === '#' ? 1 : 0;
          break;
        }

        curR += dr;
        curC += dc;
      }
    }
  }

  return occupied;
};
