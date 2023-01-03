class Range {
  min;
  max;

  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  contains(coord) {
    return this.min <= coord && this.max >= coord;
  }

  intersects(that) {
    return this.max >= that.min && this.min <= that.max
  }

  intersection(that) {
    if (!this.intersects(that)) {
      return null;
    }

    return new Range(
      this.contains(that.min) ? that.min : this.min,
      this.contains(that.max) ? that.max : this.max,
    );
  }

  union(that) {
    if (!this.intersects(that)) {
      return null;
    }

    return new Range(
      Math.min(this.min, that.min),
      Math.max(this.max, that.max)
    );
  }

  equals(that) {
    return this.min === that.min && this.max === that.max;
  }

  get size() {
    return this.max - this.min + 1;
  }

  toArray() {
    return [ this.min, this.max ];
  }
}

module.exports = Range;
