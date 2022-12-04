const { split } = require('../util');
const { add } = require('../math2');

/**
 * # [Advent of Code 2022 Day 4](https://adventofcode.com/2022/day/4)
 *
 * I created the `Range` class to represent each range of sections, and parsed the input into an
 * array of arrays of `Range`s, where each inner array contains two `Range`s representing a pair
 * of elves.
 *
 * `Range` has `contains()`, which accepts either the ID of a section or another `Range`, and
 * returns whether that section or `Range` is contained by this `Range`. It also has `overlaps()`,
 * which returns whether this `Range` overlaps the given `Range`. To detect the latter, we check
 * whether `range1` contains either endpoint of `range2`, or if `range2` contains `range1`
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const pairs = parse(input);
  return [ countContainingPairs, countOverlappingPairs ].map(fn => fn(pairs));
};

/**
 * Parses the input into an array of `Range` pairs.
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Array<Range>>} - the `Range` pairs
 */
const parse = input => split(input).map(
  line => line.split(',').map(str => new Range(str))
);

/**
 * Returns the number of pairs where one `Range` completely contains the other.
 *
 * @param {Array<Array<Range>>} pairs - the `Range` pairs
 * @returns {number} - how many pairs exist where one `Range` contains the other
 */
const countContainingPairs = pairs => add(pairs.map(
  ([ a1, a2 ]) => a1.contains(a2) || a2.contains(a1) ? 1 : 0
));

/**
 * Returns the number of overlapping `Range` pairs.
 *
 * @param {Array<Array<Range>>} pairs - the `Range` pairs
 * @returns {number} - how many pairs overlap
 */
const countOverlappingPairs = pairs => add(pairs.map(
  ([ a1, a2 ]) => a1.overlaps(a2) ? 1 : 0
));

/**
 * Represents a single section range.
 */
class Range {
  #min;
  #max;

  /**
   * Converts a range string (`{min}-{max}`) into a `Range`.
   *
   * @param {string} str - the range string
   */
  constructor(str) {
    const range = str.split('-').map(Number);
    this.#min = range[0];
    this.#max = range[1];
  }

  /**
   * @returns {number} - the minimum section ID of the range
   */
  get min() {
    return this.#min;
  }

  /**
   * @returns {number} - the maximum section ID of the range
   */
  get max() {
    return this.#max;
  }

  /**
   * Tests whether this `Range` contains the given section or `Range`.
   *
   * @param {number|Range} arg - the section or `Range` to check
   * @returns {boolean} - whether the argument is contained by this `Range`
   */
  contains(arg) {
    if (typeof arg === 'number') {
      return this.#min <= arg && arg <= this.#max;
    }

    if (arg instanceof Range) {
      return this.contains(arg.min) && this.contains(arg.max);
    }

    throw new TypeError('Argument must be a number or Range');
  }

  /**
   * Tests whether this `Range` overlaps the given `Range`.
   *
   * @param {Range} that - the other `Range`
   * @returns {boolean} - whether the two `Range`s overlap
   */
  overlaps(that) {
    return this.contains(that.min) || this.contains(that.max) || that.contains(this)
  }
}
