const { split } = require('../util');

/**
 * # [Advent of Code 2016 Day 3](https://adventofcode.com/2016/day/3)
 *
 * Pretty straightforward: Parse the input into an array of potential
 * triangles, then test each one and count the ones that are valid. For part
 * two, we can just swap three pairs of sides in every three rows of the input
 * data. In the example below, the values that have the same tens digits are
 * swapped:
 *
 * ```txt
 * 12 23 34
 * 24 41 56
 * 36 52 65
 * ```
 *
 * Each triangle in part two is now on a row, so the array can be evaluated the
 * same way as we did in part one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const triangles = split(input, '\n')
    .map(line => line.trim().split(/\s+/).map(Number));
  const part1 = countValidTriangles(triangles);
  rearrangeTriangles(triangles);
  const part2 = countValidTriangles(triangles);
  return [ part1, part2 ];
};

/**
 * Considering each row in the given array to be an array of three numbers
 * representing the lengths of the sides of a potential triangle, returns
 * the number of valid triangles in the array.
 *
 * @param {Array} triangles - the array of potential triangles
 * @returns {number} - how many valid triangles are in the array
 */
const countValidTriangles = triangles => triangles.reduce((count, triangle) => {
  return count + (isValidTriangle(triangle) ? 1 : 0);
}, 0);

/**
 * Given the lengths of the sides of a potential triangle, returns whether the
 * triangle is valid.
 *
 * @param {Array} sides - the lengths of the sides of a potential triangle
 * @returns {boolean} - whether the triangle is valid
 */
const isValidTriangle = sides => {
  return sides[0] + sides[1] > sides[2] &&
    sides[0] + sides[2] > sides[1] &&
    sides[1] + sides[2] > sides[0];
};

/**
 * Flips the lengths of every three rows in the given array across the top-left
 * to bottom-right diagonal. This results in the triangles arranged as describe
 * in part two to be flipped so that they now occupy rows.
 *
 * @param {Array} triangles - the array of possible triangles to rearrange
 */
const rearrangeTriangles = triangles => {
  for (let i = 0; i < triangles.length; i += 3) {
    swapElements(triangles, i, 1, i + 1, 0);
    swapElements(triangles, i, 2, i + 2, 0);
    swapElements(triangles, i + 1, 2, i + 2, 1);
  }
};

/**
 * Swaps two elements in the given two-dimensional array.
 *
 * @param {Array} triangles - the two-dimensional array
 * @param {number} r0 - the row of the first element
 * @param {number} c0 - the column of the first element
 * @param {number} r1 - the row of the second element
 * @param {number} c1 - the column of the second element
 */
const swapElements = (triangles, r0, c0, r1, c1) => {
  const temp = triangles[r0][c0];
  triangles[r0][c0] = triangles[r1][c1];
  triangles[r1][c1] = temp;
};
