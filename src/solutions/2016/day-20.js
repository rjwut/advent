const { match } = require('../util');

const IP_RANGE_REGEXP = /^(?<min>\d+)-(?<max>\d+)$/gm;
const IP_COUNT = 4294967296;

/**
 * # [Advent of Code 2016 Day 20](https://adventofcode.com/2016/day/20)
 *
 * IP ranges can overlap, so after parsing the ranges, we consolidate them into
 * a minimal set of non-overlapping ranges and sort them.
 *
 * Once that's done, part one is solved by starting at address `0`, and
 * checking against the first range to see if it blocks that address. If so, we
 * move to the first address after that range, and continue with the next range
 * until we find an unblocked address.
 *
 * Part two is solved simply by summing the sizes of all the consolidated 
 * ranges, and subtracting that from the total number of addresses.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const ranges = match(input, IP_RANGE_REGEXP)
    .map(range => new Range(range));
  consolidateRanges(ranges);
  return [ findSmallestUnblocked(ranges), countUnblocked(ranges) ];
};

/**
 * Consolidates the given list of potentially overlapping `Range` objects so
 * that you end with only non-overlapping `Range`s.
 *
 * @param {Array} ranges - the `Range`s to consolidate
 */
const consolidateRanges = ranges => {
  for (let i = ranges.length - 2; i >= 0; i--) {
    const range1 = ranges[i];

    for (let j = ranges.length - 1; j > i; j--) {
      const range2 = ranges[j];

      if (range1.consolidate(range2)) {
        ranges.splice(j, 1);
      }
    }
  }

  ranges.sort((a, b) => a.max - b.max);
};

/**
 * Returns the smallest IP address that is not blocked by any of the given
 * ranges, which are assumed to sorted and not overlapping.
 *
 * @param {Array} ranges - the `Range`s to check
 * @returns {number} - the smallest unblocked IP
 */
const findSmallestUnblocked = ranges => {
  let smallest = 0;

  for (const range of ranges) {
    if (!range.blocks(smallest)) {
      return smallest;
    }

    smallest = range.max + 1;
  }

  return smallest;
};

/**
 * Counts the number of addresses not blocked by any of the given ranges, which
 * are assumed to not overlap.
 *
 * @param {Array} ranges - the `Range`s to check
 * @returns {number} - the number of unblocked addresses
 */
const countUnblocked = ranges => ranges.reduce((unblocked, range) => unblocked - range.size, IP_COUNT);

/**
 * Represents a single range of IP addresses.
 */
class Range {
  #min;
  #max;

  /**
   * Constructs a new `Range` from a `RegExp` match.
   * @param {*} obj 
   */
  constructor(obj) {
    this.#min = parseInt(obj.min, 10);
    this.#max = parseInt(obj.max, 10);
  }

  /**
   * Returns the maximum address blocked by this `Range`.
   */
  get max() {
    return this.#max;
  }

  /**
   * Returns whether the given IP is blocked by this `Range`.
   *
   * @param {number} ip - the IP to check
   * @returns {boolean} - whether the given IP is blocked
   */
  blocks(ip) {
    return ip >= this.#min && ip <= this.#max;
  }

  /**
   * Determines whether this `Range` overlaps the given `Range`, and if so,
   * expands this `Range` to include the other `Range` and returns `true`. If
   * they do not overlap, no changes are made and `false` is returned.
   *
   * @param {Range} that - the other `Range` to consolidate
   * @returns {boolean} - whether the given `Range` was consolidated
   */
  consolidate(that) {
    if (this.blocks(that.#min) || this.blocks(that.#max) || that.blocks(this.#min)) {
      // These ranges overlap, consolidate them.
      this.#min = Math.min(this.#min, that.#min);
      this.#max = Math.max(this.#max, that.#max);
      return true;
    }

    return false;
  }

  /**
   * Returns the number of IPs blocked by this `Range`.
   *
   * @returns {number} - the number of blocked IPs
   */
  get size() {
    return this.#max - this.#min + 1;
  }
}
