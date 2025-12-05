const { split } = require('../util');

/**
 * # [Advent of Code 2025 Day 5](https://adventofcode.com/2025/day/5)
 *
 * Each line of the first section of input is parsed into an instance of a `Range` class that has
 * two methods. `Range`s can report their size and whether they contain a given value, and two can
 * be combined into a single `Range` representing their union if they intersect.
 *
 * After parsing a `Range`, it is checked against the previously parsed `Range`s. If it intersects
 * with one, the new `Range` is replaced by the union of the two, and the existing `Range` is
 * removed from the list. This continues until all existing `Range`s have been checked, at which
 * point the new `Range` is added to the list. When all lines have been processed, the list will not
 * contain any intersecting `Range`s.
 *
 * For part 1, we simply iterate the list of IDs provided in the input and count how many are within
 * any of the `Range`s. Part 2 is even easier: we just sum the sizes of the `Range`s.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const [ freshLines, ids ] = split(input, { group: true });

  // Parse range lines, merging intersecting ones as we go
  let freshRanges = [];
  freshLines.forEach(line => {
    const [ min, max ] = line.split('-').map(n => parseInt(n, 10));
    let range = new Range(min, max);

    for (let i = 0; i < freshRanges.length; i++) {
      const existingRange = freshRanges[i];
      const union = existingRange.union(range);

      if (union) {
        // These ranges intersect; merge them and remove the existing one from the list
        range = union;
        freshRanges.splice(i--, 1);
      }
    }

    freshRanges.push(range);
  });

  // Find the how many fresh ingredients we have
  const part1 = ids.reduce((count, id) => {
    const value = parseInt(id, 10);

    for (const range of freshRanges) {
      if (range.contains(value)) {
        return count + 1;
      }
    }

    return count;
  }, 0);

  // Sum the sizes of all the fresh ranges
  const part2 = freshRanges.reduce((sum, range) => sum + range.size, 0);

  return [ part1, part2 ];
};

/**
 * A range of ingredient IDs.
 */
class Range {
  #min;
  #max;

  /**
   * Create a new `Range` spanning the given values.
   *
   * @param {number} min - the minimum value in the `Range`
   * @param {number} max - the maximum value in the `Range`
   */
  constructor(min, max) {
    this.#min = min;
    this.#max = max;
  }

  /**
   * @returns {number} - the number of values in the `Range`
   */
  get size() {
    return this.#max - this.#min + 1;
  }

  /**
   * Checks whether this `Range` contains the given value.
   *
   * @param {number} value - the value to check
   * @returns {boolean} - whether the value is contained in the `Range`
   */
  contains(value) {
    return value >= this.#min && value <= this.#max;
  }

  /**
   * Produces a new `Range` representing the union of this `Range` and another, if they intersect.
   *
   * @param {Range} that - the other `Range` to check
   * @returns {Range|null} - the union of the two `Range`s, or `null` if they do not intersect
   */
  union(that) {
    if (this.#max < that.#min || that.#max < this.#min) {
      return null;
    }

    const min = Math.min(this.#min, that.#min);
    const max = Math.max(this.#max, that.#max);
    return new Range(min, max);
  }
}
