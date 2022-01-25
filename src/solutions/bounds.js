/**
 * Tracks the bounds of an `n`-dimensional space. The space is created upon
 * `put()`ting the first point inside it. Coordinates are represented as an
 * array of `n` numbers, where `n` is the number of dimensions in the space.
 * After the first call to `put()`, any subsequent coordinates used must match
 * the number of dimensions or an `Error` will be thrown.
 */
class Bounds {
  #bounds;

  /**
   * Returns whether the given coordinates are within the bounds. If no
   * coordinates have been `put()` into the bounds, this will return `false`.
   *
   * @param {Array} coords - the coordinates to check
   * @returns {boolean} - whether the coordinates are within the bounds
   * @throws {Error} - if there is a dimension count mismatch
   */
  isInside(coords) {
    if (!this.#bounds) {
      return false;
    }

    this.#assertDimensions(coords);
    return coords.every((coord, i) => {
      const dimension = this.#bounds[i];
      return dimension.min <= coord && coord <= dimension.max;
    });
  }

  /**
   * Returns the distance between the given coordinates and the edge of the
   * bounds. The point may be inside or outside the bounds. If no bounds have
   * been set, this will return `Infinity`.
   *
   * @param {Array} coords - the coordinates to check
   * @returns {number} - the distance between the given coordinates and the
   * edge of the bounds
   * @throws {Error} - if there is a dimension count mismatch
   */
  distanceFromBorder(coords) {
    if (!this.#bounds) {
      return Infinity;
    }

    this.#assertDimensions(coords);
    return coords.reduce((distance, coord, i) => {
      const dimension = this.#bounds[i];
      return Math.min(
        distance,
        Math.abs(coord - dimension.min),
        Math.abs(dimension.max - coord),
      );
    });
  }

  /**
   * Extends the bounds to include the given coordinates. The bounds expansion
   * cannot be reversed.
   *
   * @param {Array} coords - the coordinates to include
   * @throws {Error} - if there is a dimension count mismatch
   */
  put(coords) {
    if (this.#bounds) {
      this.#assertDimensions(coords);
      coords.forEach((coord, i) => {
        this.#bounds[i] = {
          min: Math.min(this.#bounds[i].min, coord),
          max: Math.max(this.#bounds[i].max, coord),
        }
      });
    } else {
      this.#bounds = coords.map(coord => ({
        min: coord,
        max: coord,
      }));
    }
  }

  /**
   * Returns the number of dimensions, or `undefined` if no bounds have been
   * set.
   *
   * @returns {number|undefined} - the number of dimensions
   */
  get dimensions() {
    return this.#bounds ? this.#bounds.length : undefined;
  }

  /**
   * Iterates coordinates in the grid, passing each one to `callback()`. By
   * default, each coordinate within the bounds is iterated; the `options`
   * object can change this behavior. If no coordinates have been `put()` into
   * the bounds, no error will be thrown, but `callback()` will not get
   * invoked.
   *
   * Options:
   *
   * - `dimensions` (`Array`): Allows you to override the default iteration
   *   range of each dimension. Be default, each dimension is iterated over the
   *   current bounds. If this option is specified, it must be an array with
   *   the same number of elements as the grid's dimensions. Each element must
   *   be either `null` (indicating no change to the iteration range), or an
   *   object which may have integer `min` and `max` properties. If one of
   *   those properties is specified, that bound will override the current one
   *   for that dimension.
   * - `margin`: If `margin` is specified, the bounds will be temporarily
   *   expanded (or contracted if `margin` is negative) by that amount before
   *   iterating. This has no effect on any dimension that has been overridden
   *   by the `dimensions` option.
   *
   * @param {Function} callback - the callback function to invoke
   * @param {Object} options - the iteration options
   */
  forEach(callback, options) {
    if (!this.#bounds) {
      return;
    }

    options = {
      margin: 0,
      ...options,
    }

    options.dimensions = this.#assertValidForEachDimensions(options.dimensions);
    const ranges = this.#bounds.map((dimension, i) => {
      const override = options.dimensions[i] ?? {};
      return {
        min: override.min ?? dimension.min - options.margin,
        max: override.max ?? dimension.max + options.margin,
      }
    });
    const coords = ranges.map(dimension => dimension.min);

    do {
      callback(coords);
      let i = coords.length - 1;

      do {
        const dimension = ranges[i];
        const curValue = coords[i];

        if (curValue !== dimension.max) {
          coords[i] = curValue + 1;
          break;
        }

        coords[i] = dimension.min;

        if (--i === -1) {
          return;
        }
      } while(true);
    } while (true);
  }

  /**
   * Returns an array describing the current bounds. Each element in the array
   * represents one dimension, and is an object with `min` and `max`
   * properties, describing the extent of the bounds in that dimension.
   *
   * @returns {Array} - the bounds description
   * @throws {Error} - if no bounds have been set
   */
  toArray() {
    if (!this.#bounds) {
      throw new Error('No bounds have been set');
    }

    return this.#bounds.map(dimension => ({ ...dimension }));
  }

  /**
   * Asserts that the given coordinates have the correct number of dimensions.
   *
   * @param {Array} coords - the coordinates to check
   */
  #assertDimensions(coords) {
    if (coords.length !== this.#bounds.length) {
      throw new Error(`Expected ${this.#bounds.length} dimensions, got: [${coords.join()}]`);
    }
  }

  /**
   * Ensures that the `dimensions` option for `forEach()` is valid.
   *
   * @param {Array} dimensions - the dimensions to check
   * @returns {Array} - the dimensions to use if `dimensions` is `undefined`
   * @throws {Error} - if it's invalid
   */
  #assertValidForEachDimensions(dimensions) {
    if (dimensions === undefined) {
      return new Array(this.#bounds.length);
    }

    if (!Array.isArray(dimensions)) {
      throw new Error('Dimensions must be an array');
    }

    this.#assertDimensions(dimensions);
    const invalidDimensions = dimensions.filter(dimension => {
      return typeof dimension !== 'object';
    });

    if (invalidDimensions.length) {
      throw new Error(`Invalid dimensions: [${dimensions.join(', ')}]`);
    }

    return dimensions;
  }
}

module.exports = Bounds;
