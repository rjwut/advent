const { split } = require('../util');
const ocr = require('../ocr');

const FOLD_REGEXP = /^fold along (?<axis>[xy])=(?<coord>\d+)$/;

/**
 * # [Advent of Code 2021 Day 13](https://adventofcode.com/2021/day/13)
 *
 * Iterating a large, sparse, two-dimensional array and duplicating parts of it
 * a lot is slow. So instead of doing that, I store the coordinates of the
 * marks in a `Map`: the value is the coordinates object, and the key is a
 * string representation of those coordinates. When I perform a fold, I simply
 * remove the entry for the mark, compute its new location, and re-insert it.
 * If there is a mark already there, there is no effective change to the `Map`
 * when I re-insert the mark, so overlapping marks is not a problem.
 *
 * I could also have used a `Set`, but the problem there is that it would not
 * recognize two different coordinates objects with the same coordinates as
 * representing the same point, so I would have to use strings instead, which
 * means I would have to keep parsing and stringifying them. Using a `Map` is
 * less hassle.
 *
 * For part one, I simply sum the number of entries in the `Map` after the
 * first fold. For part two, after I've performed all the folds, I produce a
 * string representation of the grid, and use my `ocr` module to read the
 * resulting glyphs.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async (input, skipOcr) => {
  const { marks, folds } = parse(input);
  const grid = buildGrid(marks);
  grid.fold(folds[0]);
  const size = grid.size();

  for (let i = 1; i < folds.length; i++) {
    grid.fold(folds[i]);
  }

  if (skipOcr) {
    return [ size, grid.toString() ];
  }

  return [ size, await ocr(grid.toString()) ];
};

/**
 * Parses the puzzle input into an array of marks and an array of folds. Each
 * mark is a string containing the mark's coordinates (`<x>,<y>`), and each
 * fold is coerced into an object with two properties:
 *
 * - `axis` (string): The name of the axis on which the fold is performed
 * - `coord` (number): The coordinate of the fold on that axis
 *
 * @param {*} input 
 * @returns 
 */
const parse = input => {
  let [ marks, folds ] = split(input, { group: true });
  folds = folds.map(line => {
    const match = line.match(FOLD_REGEXP).groups
    return { axis: match.axis, coord: parseInt(match.coord, 10) };
  });
  return { marks, folds };
};

/**
 * Parses the mark coordinates and inserts them into a `Map`. It then returns
 * an object representing an API for the grid:
 *
 * - `fold()`: Performs a fold, using the given fold object.
 * - `size()`: Returns the number of marks in the grid.
 * - `toString()`: Returns a string representation of the grid.
 *
 * @param {Array} marks - the mark coordinates
 * @returns {Object} - the grid API
 */
const buildGrid = marks => {
  const bounds = { x: 0, y: 0 };
  marks = marks.reduce((map, line) => {
    const [ x, y ] = split(line, { delimiter: ',', parseInt: true });
    map.set(`${x},${y}`, { x, y });
    bounds.x = Math.max(bounds.x, x + 1);
    bounds.y = Math.max(bounds.y, y + 1);
    return map;
  }, new Map());
  const api = {
    /**
     * Performs the fold described by the given fold object.
     *
     * @param {Object} fold - the fold to perform
     */
    fold: fold => {
      bounds[fold.axis] = fold.coord;
      [ ...marks.values() ]
        .filter(coords => coords[fold.axis] > fold.coord)
        .forEach(coords => {
          marks.delete(`${coords.x},${coords.y}`);
          coords[fold.axis] = 2 * fold.coord - coords[fold.axis];
          marks.set(`${coords.x},${coords.y}`, coords);
        })
    },

    /**
     * Returns the number of marks.
     *
     * @returns {number} - the number of marks
     */
    size: () => marks.size,

    /**
     * Returns a string representation of the grid. A mark is shown as `#`, and
     * all other cells are spaces. For debugging purposes, if the `fold`
     * parameter is specified, the location where the fold would be performed
     * is shown with `+` characters.
     *
     * @param {Object} [fold] - the fold to show
     * @returns {string} - the string representation of the grid
     */
    toString: fold => {
      const grid = new Array(bounds.y);

      for (let y = 0; y < bounds.y; y++) {
        grid[y] = new Array(bounds.x).fill(' ');
      }

      if (fold) {
        const max = bounds[fold.axis === 'x' ? 'y' : 'x'];
  
        for (let i = 0; i < max; i++) {
          const x = fold.axis === 'x' ? fold.coord : i;
          const y = fold.axis === 'y' ? fold.coord : i;
          grid[y][x] = '+';
        }
      }

      for (let coords of marks.values()) {
        grid[coords.y][coords.x] = '#';
      }

      return grid.map(line => line.join('')).join('\n');
    },
  };
  return api;
};
