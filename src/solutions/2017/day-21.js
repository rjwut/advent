const { split } = require('../util');
const SimpleGrid = require('../simple-grid');

const START = new SimpleGrid({ data: '.#.\n..#\n###' })

/**
 * # [Advent of Code 2017 Day 21](https://adventofcode.com/2017/day/21)
 *
 * Part one can be implemented brute force. I already have an `InfiniteGrid`
 * class, but for simpler cases like this where the grid is two-dimensional,
 * starts at `(0, 0)`, and is a known size, I can get more performance by using
 * a one-dimensional array to store the grid data, and simply computing the
 * index which corresponds to a given row and column. This comes up enough in
 * Advent of Code that I decided to write a `SimpleGrid` class to handle this
 * kind of scenario. Specifically for this puzzle, I made sure to include
 * methods to flip and rotate a grid, as well as copy a grid into another one.
 *
 * Both parts of the puzzle need the ability to execute the "enhancement" rules
 * as described in the puzzle, producing a new, larger grid. The `enhance()`
 * function does that. It first delegates to `splitGrid()` to produce an array
 * of sub-grids, then creates a new grid of the appropriate size and uses the
 * `SimpleGrid.paste()` method to copy the sub-grids into the new grid. After
 * doing this five times, the answer to part one is simply how many `'#'`
 * characters are present in the final grid.
 *
 * The problem with part two is the size of the final grid: every three
 * enhancements results in a grid that is nine times larger than before.
 * Performing a total of 18 enhancements results in a grid that contains
 * 4,782,969 cells, and takes a lot of computation to get there. However, it
 * can be observed that, starting with a 3x3 square, three enhancements
 * produces a 9x9 square, which is nine 3x3 squares. The same 3x3 squares can
 * be encountered over and over during the enhancements, so we can cache the
 * results to speed up computation. We also don't actually need to assemble the
 * new grid each time; we can just keep the results of the enhancements as
 * strings in a `Map`.
 *
 * We can do this in six passes of three enhancements each. Each pass, we start
 * with an array of 3x3 squares, stored as strings. Each pass, we iterate that
 * array, and perform three enhancements on each one to produce a new array
 * that contains nine times as many squares. After six passes, we have an array
 * that contains all the 3x3 squares that compose the final large grid.
 *
 * Each time we go to perform three enhancements on a square, we first check
 * the `Map` to see if we've done this one before; if so, we can just reuse the
 * results. Otherwise, we delegate to `threeEnhancements()`, which enhances
 * that square three times into a 9x9 square, breaks it down into nine 3x3
 * squares, and returns those as an array of strings, which we then cache in
 * the `Map`. The new squares are collected into an array, which is then used
 * as our starting array of squares for the next pass.
 *
 * Once we've done six passes, we just count the `'#'` characters in all the
 * resulting squares to get the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @param {number} [enhancements] - If provided, the module simply enhances the
 * starting grid the indicated number of times and returns the number of lit
 * pixels, instead of computing the answers to each part.
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, enhancements) => {
  const rules = parse(input);

  if (enhancements) {
    return part1(rules, enhancements);
  }

  return [ part1, part2 ].map(fn => fn(rules));
};

/**
 * Parses the input rules. For each rule, the starting grid is flipped and
 * rotated to produce all possible orientations, which are then added as
 * separate rules.
 *
 * @param {string} input - the puzzle input
 * @returns {Map} - the parsed rules
 */
const parse = input => {
  const rules = new Map();
  split(input).forEach(line => {
    const [ before, after ] = line.split(' => ').map(str => str.replaceAll('/', '\n'));
    rules.set(before, after);
    let grid = new SimpleGrid({ data: before });
    let flipped = grid.flipRows();
    rules.set(flipped.toString(), after);

    for (let i = 0; i < 3; i++) {
      grid = grid.rotate(1);
      rules.set(grid.toString(), after);
      flipped = flipped.rotate(1);
      rules.set(flipped.toString(), after);
    }
  });
  return rules;
}

/**
 * Performs the given number of enhancements and returns the number of lit
 * pixels at the end.
 *
 * @param {Map} rules - the enhancment rules
 * @param {number} enhancements - the number of enhancements to perform
 * @returns {number} - the number of lit pixels
 */
const part1 = (rules, enhancements = 5) => {
  let grid = START;

  for (let i = 0; i < enhancements; i++) {
    grid = enhance(grid, rules);
  }

  return grid.reduce((count, cell) => count + (cell === '#' ? 1 : 0), 0);
};

/**
 * Computes the number of lit pixels after 18 enhancements. This uses a
 * different method than part one, because while this method is more efficient,
 * it only works when the number of enhancements is a multiple of three.
 *
 * @param {Map} rules - the enhancment rules
 * @returns {number} - the number of lit pixels
 */
const part2 = rules => {
  const xforms = new Map();
  let squares = [ START.toString() ];

  for (let i = 0; i < 6; i++) {
    const newSquares = [];

    for (const square of squares) {
      let xform = xforms.get(square);

      if (!xform) {
        xform = threeEnhancements(square, rules);
        xforms.set(square, xform);
      }

      xform.forEach(newSquare => newSquares.push(newSquare));
    }

    squares = newSquares;
  }

  return squares.reduce((count, square) => {
    return count + square.replaceAll(/[^#]/g, '').length;
  }, 0);
};

/**
 * Performs three enhancements on the given square, and splits the resulting
 * 9x9 square into nine 3x3 squares.
 *
 * @param {string} square - the starting square
 * @param {Map} rules - the enhancement rules
 * @returns {Array} - the resulting squares
 */
const threeEnhancements = (square, rules) => {
  let grid = new SimpleGrid({ data: square });

  for (let i = 0; i < 3; i++) {
    grid = enhance(grid, rules);
  }

  return splitGrid(grid, 3).map(newSquare => newSquare.toString());
};

/**
 * Performs a single enhancement operation.
 *
 * @param {SimpleGrid} grid - the grid to enhance
 * @param {Map} rules - the enhancement rules
 * @returns {SimpleGrid} - the enhanced grid
 */
const enhance = (grid, rules) => {
  const oldSquareSize = grid.rows % 2 === 0 ? 2 : 3;
  const newSquareSize = oldSquareSize + 1;
  const squares = splitGrid(grid, oldSquareSize)
    .map(square => new SimpleGrid({ data: rules.get(square) }));
  const newGridSize = Math.sqrt(squares.length) * newSquareSize;
  const newGrid = new SimpleGrid({ rows: newGridSize, cols: newGridSize });

  for (let r = 0; r < newGridSize; r += newSquareSize) {
    for (let c = 0; c < newGridSize; c += newSquareSize) {
      newGrid.paste(squares.shift(), r, c);
    }
  }

  return newGrid;
};

/**
 * Splits the given `SimpleGrid` into an array of smaller squares (represented
 * as strings).
 *
 * @param {SimpleGrid} grid - the grid to split
 * @param {number} size - the size of each square
 * @returns {Array} - the split squares
 */
const splitGrid = (grid, size) => {
  const squares = [];

  for (let r = 0; r < grid.rows; r += size) {
    for (let c = 0; c < grid.cols; c += size) {
      squares.push(grid.slice(r, c, size, size).toString());
    }
  }

  return squares;
};
