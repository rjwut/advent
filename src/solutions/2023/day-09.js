const { split } = require('../util');
const { add } = require('../math2');

/**
 * # [Advent of Code 2023 Day 9](https://adventofcode.com/2023/day/9)
 *
 * No special trick to this one. Once the triangle is built, the procedure to compute the next
 * value is:
 *
 * 1. Set the value to `0`.
 * 2. Iterate up the rows, starting from the second to last row.
 * 3. If we're computing the right corner value, add the last value in the row to the current
 *    value. Otherwise, subtract the current value from the first value in the row.
 * 4. The value after iterating the top row is the target value.
 *
 * After following this for each triangle, the sum of the generated values is the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const triangles = split(input).map(line => new Triangle(line));
  return [ 1, -1 ].map(
    direction => add(triangles.map(
      triangle => triangle.expand(direction)
    ))
  );
};

/**
 * Holds the "triangle" of numbers and allows for computation of expansion in either direction.
 */
class Triangle {
  #rows;

  /**
   * Parses the top line of the triangle.
   *
   * @param {string} line - the line to parse
   */
  constructor(line) {
    this.#rows = [ line.split(' ').map(Number) ];
    this.#populate();
  }

  /**
   * Computes the value that would be at the top corner of the triangle were it expanded by one
   * value in the indicated direction (1 = right, -1 = left).
   *
   * @param {number} direction - the direction to expand
   * @returns {number} - the value at the top corner
   */
  expand(direction) {
    let value = 0;

    for (let i = this.#rows.length - 2; i >= 0; i--) {
      const row = this.#rows[i];

      if (direction === 1) {
        value = row[row.length - 1] + value
      } else {
        value = row[0] - value;
      }
    }

    return value;
  }

  /**
   * Populates additional rows in the `Triangle` until a row contains only `0`s.
   */
  #populate() {
    let last = this.#rows[this.#rows.length - 1];

    while (last.some(n => n !== 0)) {
      const next = [];

      for (let i = 1; i < last.length; i++) {
        next.push(last[i] - last[i - 1]);
      }

      this.#rows.push(next);
      last = next;
    }
  }
}
