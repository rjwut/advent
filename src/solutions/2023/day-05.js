const { split } = require('../util');
const Range = require('../range');

/**
 * # [Advent of Code 2023 Day 5](https://adventofcode.com/2023/day/5)
 *
 * The puzzle describes a tiered system where each tier translates an input value to another
 * value. In part one, you're given descrete values to propagate through, while
 * part two gives you ranges of values for inputs instead. The diagram below illustrates a single
 * input value being translated as it passes through the tiers in the system.
 *
 * ```txt
 *    | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
 *    |        |        |        |        |        |
 *    |        |        |      ,-|--------|--.     |
 * ---|---.    |        |     /  |        |   \    |
 *    |    `---|--.     |    /   |        |    \   |
 *    |        |   \    |   /    |        |     `--|---
 *    |        |    \   |  /     |        |        |
 *    |        |     `--|-'      |        |        |
 *    |        |        |        |        |        |
 * ```
 *
 * Each tier consists of non-overlapping ranges of input values which are translated to
 * corresponding ranges of output values. When an input value is received, it is translated by
 * whichever mapping in the tier has an input range that contains that value. If no mapping handles
 * the input value, it is passed on unchanged to the next tier.
 *
 * For handling a range of inputs, the input range is compared against the input range of each
 * mapping. If the two ranges intersect, that intersection is translated by the mapping. This is
 * repeated for all mappings. Just like with single input values, any part of the input range which
 * is not handled by any mapping is passed through unchanged to the next tier.
 *
 * I broke down the problem into three classes:
 *
 * - `Mapping`: Responsible for translating values or ranges that fall within a single input range
 *   to a corresponding output range. When receiving a input value, it produces an output value if
 *   the input value falls within its input range; otherwise, it produces `null`. Similarly, if it
 *   receives a range which intersects with its input range, it will return an object that
 *   describes that intersection and the corresponding output range; otherwise, it returns `null`.
 * - `MappingTier`: A single tier of the mapping system, which contains a series of `Mapping`s.
 *   When handing an input range, it delegates the computing the output ranges to the individual
 *   `Mappings`, and aggregates them into a single array. It will also determine if any parts of an
 *   input range weren't covered by the `Mapping`s and "forward" those to the next tier.
 * - `MappingSystem`: Contains all the `MappingTier`s and propagates values and ranges through
 *   them.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let groups = split(input, { group: true });
  const seedNumbers = groups[0][0].split(' ').slice(1).map(Number);
  const data = new MappingSystem(groups.slice(1));
  return [ part1, part2 ].map(part => part(data, seedNumbers));
};

/**
 * Solves part 1 of the puzzle.
 *
 * @param {MappingSystem} system - the mapping system built by the input
 * @param {Array<number>} seedNumbers - the seed numbers parsed from the input
 * @returns {number} - the answer to part 1
 */
const part1 = (system, seedNumbers) => system.mapValues(seedNumbers).reduce(
  (lowest, value) => Math.min(lowest, value),
  Infinity
);

/**
 * Solves part 2 of the puzzle.
 *
 * @param {MappingSystem} system - the mapping system built by the input
 * @param {Array<number>} seedNumbers - the seed numbers parsed from the input
 * @returns {number} - the answer to part 2
 */
const part2 = (system, seedNumbers) => {
  const seedRanges = [];

  for (let i = 0; i < seedNumbers.length; i += 2) {
    seedRanges.push(new Range(seedNumbers[i], seedNumbers[i] + seedNumbers[i + 1] - 1));
  }

  const locationRanges = system.mapRanges(seedRanges);
  return locationRanges.reduce((best, range) => Math.min(best, range.min), Infinity);
};

/**
 * Contains all the mapping tiers.
 */
class MappingSystem {
  /**
   * @param {Array<Array<string>>} groups - the groups of lines from the input describing the
   * mapping system; each inner array of strings is a single tier
   */
  constructor(groups) {
    this.tiers = groups.map(group => new MappingTier(group));
  }

  /**
   * Maps an array of individual values through the `MappingSystem`.
   *
   * @param {Array<number>} values - the values to map
   * @returns {Array<number>} - the output values
   */
  mapValues(values) {
    return values.map(
      value => this.tiers.reduce(
        (acc, tier) => tier.mapValue(acc),
        value
      )
    );
  }

  /**
   * Maps an array of `Range`s through the `MappingSystem`.
   *
   * @param {Array<Range>} ranges - the `Range`s to map
   * @returns {Array<Range>} - the output `Range`s
   */
  mapRanges(ranges) {
    return this.tiers.reduce(
      (acc, tier) => acc.map(range => tier.mapRange(range)).flat(),
      ranges
    );
  }
}

/**
 * A single tier in the `MappingSystem`.
 */
class MappingTier {
  /**
   * @param {Array<string>} group - a group of input lines describing this tier
   */
  constructor(group) {
    this.mappings = group.slice(1).map(line => new Mapping(line));
  }

  /**
   * Maps a single value through this `MappingTier`.
   *
   * @param {number} value - the value to map
   * @returns {number} - the output value
   */
  mapValue(value) {
    for (const mapping of this.mappings) {
      const mapped = mapping.mapValue(value);

      if (mapped !== null) {
        return mapped;
      }
    }

    return value;
  }

  /**
   * Maps a single `Range` through this `MappingTier`.
   *
   * @param {Range} range - the `Range` to map
   * @returns {Array<Range>} - the output `Range`s
   */
  mapRange(range) {
    const mappedFrom = [];
    const mappedTo = [];

    for (const mapping of this.mappings) {
      const result = mapping.mapRange(range);

      if (!result) {
        continue;
      }

      mappedFrom.push(result.intersection);
      mappedTo.push(result.mappedTo);
    }

    mappedTo.push(...range.subtract(...mappedFrom));
    return mappedTo;
  }
}

/**
 * Handles a single mapping from an input range to an output range, corresponding to a single line
 * of the input.
 */
class Mapping {
  /**
   * @param {string} line - the input line describing this `Mapping`
   */
  constructor(line) {
    const [ destStart, srcStart, length ] = line.split(' ').map(Number);
    this.srcRange = new Range(srcStart, srcStart + length - 1);
    this.destRange = new Range(destStart, destStart + length - 1);
  }

  /**
   * Maps a single value through this `Mapping`, if it falls within the input range.
   *
   * @param {number} value - the value to map
   * @returns {number|null} - the output value, or `null` if the input value doesn't fall within
   * the `Mapping`'s input `Range`
   */
  mapValue(value) {
    return this.srcRange.contains(value) ? value - this.srcRange.min + this.destRange.min : null;
  }

  /**
   * Maps a single `Range` through this `Mapping`, if it falls within the input range.
   *
   * @param {Range} range - the `Range` to map
   * @returns {Object|null} - an object describing the intersection and the corresponding output,
   * or `null` if the given `Range` doesn't intersect with the `Mapping`'s input `Range`
   */
  mapRange(range) {
    const intersection = this.srcRange.intersection(range);

    if (!intersection) {
      return null;
    }

    const mappedTo = this.destRange.subrange(
      intersection.min - this.srcRange.min,
      intersection.size
    );
    return { intersection, mappedTo };
  }

  /**
   * @returns {string} - a string representation of this `Mapping`
   */
  toString() {
    return `${this.srcRange} -> ${this.destRange}`;
  }
}
