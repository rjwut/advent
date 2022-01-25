const AbstractInfiniteGrid = require('./abstract-infinite-grid');

/**
 * Represents an infinite n-dimensional grid of elements. Coordinates are
 * represented as an array of `n` numbers, where `n` is the number of
 * dimensions in the grid. The number of dimensions in the grid is set when you
 * `put()` the first element in it; any subsequent coordinates must match the
 * number of dimensions or an `Error` will be thrown.
 *
 * An `InfiniteGrid` has several advantages over a multi-dimensional array:
 *
 * - Multi-dimensional array
 *   - Coordinates must start at `0`. If you don't perform coordinate
 *     translation, it will waste a lot of memory if your actual coordinates
 *     start at some value much larger than `0`. Negative coordinates are
 *     impossible without translation.
 *   - Must resize if coordinates exceed the current bounds.
 *   - Sparse grids waste a lot of memory with empty elements.
 *   - Becomes more unweildly as you increase the number of dimensions.
 * - `InfiniteGrid`
 *   - No coordinate translation needed, even with negative coordinates.
 *   - No need to resize.
 *   - No empty elements are stored.
 *   - Just as easy to use no matter how many dimensions are involved.
 *
 * The cost for these advantages is that storage and lookup requires converting
 * the coordinates to a string, which is then used as `Map` key to look up the
 * element, which won't be quite as fast as looking up data with array indexes.
 *
 * As you `put()` elements in the grid, it keeps track of the bounds in each
 * dimension within which the elements are located. This can later be used to:
 *
 * - Retrieve the bounds
 * - Check whether a coordinate is within the bounds
 * - To iterate all the coordinates within the bounds, even if they are empty
 */
class InfiniteGrid extends AbstractInfiniteGrid {
  /**
   * Creates a new `InfiniteGrid`, optionally copying the elements from another
   * `InfiniteGrid`.
   *
   * @param {InfiniteGrid} [copyFrom] - the grid to copy from
   */
  constructor(copyFrom) {
    const cells = new Map();
    const storage = {
      size: () => cells.size,
      get: key => cells.get(key),
      put: (key, value) => {
        if (value === undefined) {
          cells.delete(key);
          return false;
        }

        cells.set(key, value);
        return true;
      },
      forEach: callback => {
        cells.forEach((value, key) => callback(key, value));
      },
      translate: value => value === undefined ? ',' : String(value).charAt(0),
    };
    super(storage, copyFrom);
  }
}

module.exports = InfiniteGrid;
