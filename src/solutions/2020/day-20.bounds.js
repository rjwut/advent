/**
 * Returns a new bounds object containing a single coordinate: (0,0). The
 * bounds object offers the following methods:
 * - `get()`: Returns an object describing the bounds.
 * - `put(coord)`: Extends the bounds to include the given coordinate.
 * - `iterate(fn)`: Passes each coordinate within the bounds into the given
 *   function.
 * - `map(fn)`: Returns a two-dimensional array, where each cell contains the
 *   value returned by the given function when passed the corresponding
 *   coordinate.
 * 2020/day-20.bounds
 * @returns {Object} - the new bounds object
 */
 module.exports = () => {
  const x = { min: 0, max: 0 };
  const y = { min: 0, max: 0 };
  const api = {
    /**
     * Returns an object describing the bounds. The object has the following
     * properties:
     * - `x.min` and `x.max`: The minimum and maximum X coordinates.
     * - `y.min` and `y.max`: The minimum and maximum Y coordinates.
     * - `w` and `h`: The width and height of the bounding rectangle.
     * @returns {Object} - the bounds description
     */
    get: () => ({
      x: { ...x },
      y: { ...y },
      w: x.max - x.min + 1,
      h: y.max - y.min + 1,
    }),

    /**
     * Expands the bounds to include the given coordinates.
     * @param {Object} coords - the coordinates to include
     */
    put: coords => {
      x.min = Math.min(x.min, coords.x);
      x.max = Math.max(x.max, coords.x);
      y.min = Math.min(y.min, coords.y);
      y.max = Math.max(y.max, coords.y);
    },

    /**
     * Invokes `fn()` for every coordinate within the bounds.
     * @param {Function} fn - the function to invoke
     */
    iterate: fn => {
      for (let cy = y.min; cy <= y.max; cy++) {
        for (let cx = x.min; cx <= x.max; cx++) {
          fn({ x: cx, y: cy });
        }
      }
    },

    /**
     * Generates a two-dimensional array, where [0][0] corresponds to the
     * upper-left cell in the grid. For each grid coordinate in the bounds,
     * `fn()` will be called, and the return value will be populated into the
     * array at the corresponding element.
     * @param {Function} fn - the function to invoke for each coordinate
     * @returns {Array} - the resulting two-dimensional array
     */
    map: fn => {
      const width = x.max - x.min + 1;
      const height = y.max - y.min + 1;
      const array = new Array(height);

      for (let r = 0; r < height; r++) {
        array[r] = new Array(width);
      }

      api.iterate(coords => {
        array[coords.y - y.min][coords.x - x.min] = fn(coords);
      });

      return array;
    },
  };
  return api;
};
