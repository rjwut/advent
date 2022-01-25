const { multiply } = require('../math2');
const { parseGrid } = require('../util');

const PART_DELTAS = [
  [
    { r: 1, c: 3 }
  ],
  [
    { r: 1, c: 1 },
    { r: 1, c: 3 },
    { r: 1, c: 5 },
    { r: 1, c: 7 },
    { r: 2, c: 1 },
  ],
];
const TREE = '#';

/**
 * # [Advent of Code 2020 Day 3](https://adventofcode.com/2020/day/3)
 *
 * Parsing the map is easy; we just split the input into lines and split each
 * line into characters to create a two-dimensional array where each cell
 * contains either `'#'` or `'.'`. The `parseGrid()` function from my `util`
 * module handles this nicely for us.
 * 
 * We can generalize both parts of the puzzle by creating a `solve()` function
 * that can compute the answer for any number of paths. We'll make it accept
 * two arguments: the tree map, and a list of "delta" objects, where each delta
 * object describes how many rows and columns to move with each iteration. For
 * part 1, our list will only have one delta object; for part two, it will have
 * five. We then compute how many trees are encountered on each path, and
 * multiply the results together.
 * 
 * To simplify this, we'll create a `solvePath()` function which will be
 * responsible for computing how many trees are encountered on a single path.
 * So we pass in the map and a single delta object. We track our current
 * position in two variables, `r` and `c`, then loop until `r` passes the
 * bottom row. For each iteration of the loop, we add the delta values to `r`
 * and `c`. In the case of `c`, we use the modulus operator (`%`) so that we
 * automatically wrap back around the left side if we go off the right edge of
 * the map. Then we just check to see if that cell in the map has a tree in it
 * and increment our tree counter if so.
 * 
 * Calling `map()` for all of our deltas and calling `solvePath()` for each one
 * gives us an array containing the number of trees encountered on each path.
 * Now we just multiply them together, and we have the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
 module.exports = input => {
  input = parseGrid(input);
  return PART_DELTAS.map(deltas => solve(input, deltas));
};

/**
 * Solves a part of the puzzle. The deltas argument is an array of delta
 * objects describing how many rows and columns to move each iteration.
 *
 * @param {Array} map - the tree map
 * @param {Array} deltas - an array of delta objects
 * @returns {number} - the puzzle output
 */
const solve = (map, deltas) => {
  return multiply(deltas.map(delta => solvePath(map, delta)));
};

/**
 * Given the tree map and a delta object, returns the number of trees
 * encountered on the path. The delta object has two properties, `r` and `c`,
 * set to the number of rows/columns to move for each iteration.
 *
 * @param {Array} map - the tree map
 * @param {Object} delta - a delta object 
 * @returns {number} - the number of tree encounters
 */
const solvePath = (map, delta) => {
  let r = 0, c = 0, treeCount = 0;

  while (true) {
    r += delta.r;

    if (r >= map.length) {
      return treeCount;
    }

    const row = map[r];
    c = (c + delta.c) % row.length;

    if (row[c] === TREE) {
      treeCount++;
    }
  }
};
