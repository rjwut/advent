const Bounds = require('./bounds');
const { arraysEqual, group } = require('./util');

/**
 * An abstract class providing common functionality between `InfiniteGrid` and
 * `BooleanInfiniteGrid`.
 */
class AbstractInfiniteGrid {
  #bounds = new Bounds();
  #storage;

  /**
   * Creates a new `AbstractInfiniteGrid`, optionally copying the elements from
   * another `AbstractInfiniteGrid`. You must provide a `storage` object which
   * is responsible for storing grid elements. It has the following methods:
   *
   * - `size()`: Returns the number of stored elements.
   * - `get(key)`: Returns the element stored at the given key or a default
   *   value if no element is stored there.
   * - `put(key, value)`: Stores the given element at the named key. If `value`
   *   is equal to the default value, the element should be removed instead.
   *   This method should return `true` if an element was added or replaced,
   *   and `false` if an element was removed.
   * - `forEach(callback)`: Iterates all the elements in the grid, invoking
   *   `callback()` for each. The `callback` function should receive two
   *   arguments: the key under which the element was stored, and the value
   *   stored there.
   * - `translate(value)`: Performs the default translation of a value for
   *   rendering a cell in `toString()`.
   *
   * @param {Object} storage - the storage object
   * @param {AbstractInfiniteGrid} [copyFrom] - the grid to copy from
   */
  constructor(storage, copyFrom) {
    this.#storage = storage;

    if (copyFrom) {
      copyFrom.forEachSparse((coords, value) => {
        this.put(coords, value);
      });
    }
  }

  /**
   * Returns whether the grid is empty.
   *
   * @returns {boolean} - `true` if empty; `false` otherwise
   */
  get empty() {
    return this.#storage.size === 0;
  }

  /**
   * Returns the number of elements in the grid.
   *
   * @returns {number} - the number of elements
   */
  get size() {
    return this.#storage.size();
  }

  /**
   * Returns the value of the given coordinates in the grid.
   *
   * @param {Array} coords - the coordinates of the value to return
   * @returns {*} - the value
   * @throws {Error} - if there is a dimension count mismatch
   */
  get(coords) {
    this.#assertDimensions(coords);
    return this.#storage.get(coords.join(','));
  }

  /**
   * Stores a value at the given coordinates in the grid. This will expand the
   * grid's bounds if required. Note that expansion of the bounds can't be
   * reversed.
   *
   * @param {Array} coords - the coordinates of the value to store
   * @param {boolean} value - the value to store
   * @throws {Error} - if there is a dimension count mismatch
   */
  put(coords, value) {
    this.#assertDimensions(coords);
    const key = coords.join();

    if (this.#storage.put(key, value)) {
      this.#bounds.put(coords);
    }
  }

  /**
   * Returns an array describing the smallest n-dimensional space that includes
   * all of the elements inserted in the grid. Each element in the array
   * represents one dimension, and is an object with `min` and `max`
   * properties, describing the extent of the bounds in that dimension.
   *
   * @returns {Array} - an array describing the current bounds
   * @throws {Error} - if there are no elements in the grid
   */
  getBounds() {
    return this.#bounds.toArray();
  }

  /**
   * Returns whether the given coordinates are within the bounds of the grid.
   * If no elements have been `put()` into the grid, this will return `false`
   * (because all coordinates are out of bounds).
   *
   * @param {Array} coords - the coordinates to check
   * @returns {boolean} - whether the coordinates are within the bounds of the
   * grid
   */
  inBounds(coords) {
    return this.#bounds.isInside(coords);
  }

  /**
   * Iterates each cell within the bounds of the grid, including empty ones.
   * The given `callback()` function will be invoked for each cell, and will
   * receive the element stored at that cell (or the default value if no
   * element is stored there) and the coordinates of that cell. If no elements
   * have been inserted into the grid, no error will be thrown, but
   * `callback()` will not be invoked (because no cells are in bounds).
   *
   * An `options` object may be provided; see the `options` parameter for
   * the `bounds.forEach()` method for details.
   *
   * @param {Function} callback - the function to invoke for each cell
   * @param {Object} [options] - iteration options
   */
  forEach(callback, options) {
    if (!this.#bounds) {
      return;
    }

    this.#bounds.forEach(coords => {
      callback(coords, this.#storage.get(coords.join(',')));
    }, options);
  }

  /**
   * Iterates all the elements in the grid. This differs from `forEach()` in
   * the following ways:
   *
   * - Empty cells in the grid are skipped.
   * - Elements are iterated in insertion order rather than coordinate order.
   * - No `options` parameter is accepted.
   *
   * @param {Function} callback - the function to invoke for each element
   */
  forEachSparse(callback) {
    this.#storage.forEach((key, value) => {
      callback(key.split(',').map(Number), value);
    });
  }

  /**
   * Iterates all the cells within `distance` of the given coordinates. The
   * given `callback()` function will be invoked for each cell, and will
   * receive the value stored at that cell and the coordinates of that cell.
   * The indicated cells will be iterated, even if they lie outside the grid's
   * bounds, and even if no elements have been inserted into the grid at all.
   *
   * @param {Array} coords - the coordinates at the center of the iterated
   * space
   * @param {Function} callback - the function to invoke for each cell
   * @param {number} [distance=1] - the number of cells in each direction which
   * are considered "near" the center cell
   * @param {boolean} [omitSelf=false] - whether to skip the given coordinates
   * when iterating cells
   */
  forEachNear(coords, callback, options) {
    options = {
      distance: 1,
      omitSelf: false,
      ...options
    };
    const space = new Bounds();
    space.put(coords);
    space.forEach(nearCoords => {
      if (!options.omitSelf || !arraysEqual(coords, nearCoords)) {
        callback(nearCoords, this.#storage.get(nearCoords.join(',')));
      }
    }, { margin: options.distance });
  }

  /**
   * Returns a string representation of a 2D plane of the grid. This method can
   * only be called for a grid of at least two dimensions. The method will
   * iterate two dimensions of the grid; the first iterated dimension will be
   * treated as rows, and the second as columns. After the resulting value is
   * translated, the first character of the return value will be rendered; if
   * it returns `undefined`, it will render a `'.'`.
   *
   * Options:
   *
   * - `dimensions` (`Array`): Allows you to specify which dimensions to
   *   iterate, and the values for any other, non-iterated dimensions. If not
   *   specified, the first two dimensions will be iterated, and the rest will
   *   be set to `0`. The given array must comply with the following
   *   requirements:
   *   - Has the same number of elements as the grid has dimensions
   *   - Must have exactly two `null` elements (indicating they are to be
   *     iterated)
   *   - All remaining elements must be integer values (the coordinates to set
   *     for those dimensions)
   * - `translate` (`Function`): If specified, the value stored in each cell
   *   will be passed through this function before being rendered into the
   *   grid.
   *
   * @param {Object} [options] - the render options
   */
   toString(options) {
    if (this.#bounds.dimensions === undefined) {
      throw new Error('Cannot render an empty grid');
    }

    if (this.#bounds.dimensions < 2) {
      throw new Error('Grid must have at least two dimensions');
    }

    options = {
      translate: this.#storage.translate,
      ...options,
    };

    options.dimensions = this.#assertValidToStringDimensions(options.dimensions);
    options.dimensions = options.dimensions.map(dimension => {
      return dimension === null ? null : { min: dimension, max: dimension };
    });
    const rowDimension = options.dimensions.indexOf(null);
    const rows = [];
    let row;
    let lastRow;
    this.#bounds.forEach(coords => {
      if (coords[rowDimension] !== lastRow) {
        if (row) {
          rows.push(row.join(''));
        }

        row = [];
        lastRow = coords[rowDimension];
      }

      const value = options.translate(this.#storage.get(coords.join(',')));
      row.push(value === undefined ? '.' : String(value).charAt(0));
    }, options);

    rows.push(row.join(''));
    return rows.join('\n');
  }

  /**
   * Throws an `Error` if the given coordinates don't match the number of
   * dimensions in the grid. No `Error` is thrown if the grid's dimensions
   * haven't yet been set.
   *
   * @param {Array} coords - the coordinates to check
   */
  #assertDimensions(coords) {
    if (this.#bounds.dimensions !== undefined && coords.length !== this.#bounds.dimensions) {
      throw new Error(`Expected ${this.#bounds.dimensions} dimensions, got [${coords.join(', ')}]`);
    }
  }

  /**
   * Asserts that the `dimensions` object is either `undefined` or an array
   * that is the same length as the grid's dimensions, and that exactly two
   * dimensions are `null` and the rest are integers. If the argument is an
   * array, that array is returned; otherwise, a new array is returned with the
   * first two dimensions set to `null` and the rest set to `0`.
   *
   * @param {Array} dimensions - the dimensions to check
   * @returns {Array} - the dimensions
   */
  #assertValidToStringDimensions(dimensions) {
    if (dimensions === undefined) {
      dimensions = new Array(this.#bounds.dimensions);
      dimensions.fill(null, 0, 2);
      dimensions.fill(0, 2);
      return dimensions;
    }

    if (!Array.isArray(dimensions)) {
      throw new Error('The dimensions option must be an array');
    }

    this.#assertDimensions(dimensions);
    const grouped = group(dimensions, dimension => dimension === null);

    if (grouped.get(true).length !== 2) {
      throw new Error('Expected exactly two null dimensions');
    }

    if (grouped.get(false).some(dimension => !Number.isInteger(dimension))) {
      throw new Error('Expected defined dimensions to be integers');
    }

    return dimensions;
  }
}

module.exports = AbstractInfiniteGrid;
