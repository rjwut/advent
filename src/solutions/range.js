/**
 * Represents a mutable range of integers. The `min` and `max` values are both inclusive.
 */
class Range {
  min;
  max;

  /**
   * Creates a new `Range` with the given `min` and `max` values.
   *
   * @param {number} min
   * @param {number} max
   */
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  /**
   * Creates a copy of this `Range`.
   *
   * @returns {Range} - the clone
   */
  clone() {
    return new Range(this.min, this.max);
  }

  /**
   * Returns a sub-`Range` of this `Range`.
   *
   * @param {number} offset - the offset from the `min` value of this `Range` where the sub-`Range`
   * begins
   * @param {number} length - the length of the sub-`Range`
   * @returns {Range} - the sub-`Range`
   * @throws {Error} - if `offset` is negative or greater than or equal to the length of the
   * `Range`
   * @throws {Error} - if `length` is less than `1` or causes the end of the sub-`Range` to pass
   * the end of this `Range`
   */
  subrange(offset, length) {
    if (offset < 0 || offset >= this.size) {
      throw new Error(`Subrange offset out of range: ${offset}`);
    }

    const min = this.min + offset;
    const max = min + length - 1;

    if (length < 1 || max > this.max) {
      throw new Error(`Subrange length out of range: ${length}`);
    }

    return new Range(min, max);
  }

  /**
   * @param {number} value
   * @returns {boolean} - whether `value` is contained in this `Range`
   */
  contains(value) {
    return this.min <= value && this.max >= value;
  }

  /**
   * @param {Range} that - another `Range`
   * @returns {boolean} - whether `this` is completely contained within `that`
   */
  containsRange(that) {
    return this.contains(that.min) && this.contains(that.max);
  }

  /**
   * @param {Range} that - another `Range`
   * @returns {boolean} - whether `this` intersects with `that`
   */
  intersects(that) {
    return this.max >= that.min && this.min <= that.max
  }

  /**
   * Produces the intersection between `this` and `that`.
   *
   * @param {Range} that - another `Range`
   * @returns {Range|null} - the intersection, or `null` if there is no intersection
   */
  intersection(that) {
    if (!this.intersects(that)) {
      return null;
    }

    return new Range(
      this.contains(that.min) ? that.min : this.min,
      this.contains(that.max) ? that.max : this.max,
    );
  }

  /**
   * Returns a single `Range` that represents the union of two intersecting `Range`s.
   *
   * @param {Range} that - another `Range`
   * @returns {Range|null} - the union, or `null` if there is no intersection
   */
  union(that) {
    if (!this.intersects(that)) {
      return null;
    }

    return new Range(
      Math.min(this.min, that.min),
      Math.max(this.max, that.max)
    );
  }

  /**
   * Determines what subranges of this `Range` remain after removing the intersections between this
   * `Range` and the given `Ranges`. In other words, this returns `Range`s describing all values in
   * this `Range` that aren't in any of the given `Range`s.
   *
   * @param {Range} that - the other `Range`
   * @param {Array<Range>} - the remaining sub-`Ranges`
   */
  subtract(...others) {
    let ranges = [ this ];
    let next;
    others.forEach(other => {
      next = [];
      ranges.forEach(range => {
        const intersection = range.intersection(other);

        if (intersection) {
          if (intersection.min > range.min) {
            next.push(new Range(range.min, intersection.min - 1));
          }

          if (intersection.max < range.max) {
            next.push(new Range(intersection.max + 1, range.max));
          }
        } else {
          next.push(range);
        }
      });
      ranges = next;
    });

    return ranges;
  }

  /**
   * @param {Range} that - another `Range`
   * @returns {boolean} - whether `this` and `that` contain the same values
   */
  equals(that) {
    return this.min === that.min && this.max === that.max;
  }

  /**
   * @returns {number} - the number of integers in this `Range`
   */
  get size() {
    return this.max - this.min + 1;
  }

  /**
   * @returns {Array<number>} - an array containing the `min` and `max` values of this `Range`
   */
  toArray() {
    return [ this.min, this.max ];
  }

  /**
   * @returns {string} - a string representation of this `Range`
   */
  toString() {
    return `[${this.min},${this.max}]`;
  }
}

module.exports = Range;
