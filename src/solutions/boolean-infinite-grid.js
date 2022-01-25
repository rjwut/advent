const AbstractInfiniteGrid = require('./abstract-infinite-grid');

/**
 * This class is similar to `InfiniteGrid`, but all elements in the grid are
 * booleans, and coordinates where no element is stored default to `false`
 * rather than `undefined`. Under the hood, it uses a `Set` to store the
 * elements instead of a `Map`, where all coordinates which are `true` are
 * found in the `Set`, and all other coordinates are `false`.
 */
class BooleanInfiniteGrid extends AbstractInfiniteGrid {
  /**
   * Creates a new `BooleanInfiniteGrid`, optionally copying the elements from
   * another `BooleanInfiniteGrid`.
   *
   * @param {BooleanInfiniteGrid} [copyFrom] - the grid to copy from
   */
  constructor(copyFrom) {
    const cells = new Set();
    const storage = {
      size: () => cells.size,
      get: key => cells.has(key),
      put: (key, value) => {
        if (value === false) {
          cells.delete(key);
          return false;
        }

        cells.add(key);
        return true;
      },
      forEach: callback => {
        cells.forEach(key => callback(key, true));
      },
      translate: value => value ? '#' : '.',
    };
    super(storage, copyFrom);
  }
}

module.exports = BooleanInfiniteGrid;
