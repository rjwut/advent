const { add } = require('../math2');

const BRIGHT_GREEN = '\u001b[32m\u001b[1m';
const BLUE = '\u001b[34m\u001b[1m';
const RESET = '\u001b[0m';

/**
 * Accepts a square, two-dimensional array of characters and returns an object
 * that facilitates reading and writing the characters against the translated
 * matrix.
 * 
 * The matrix data is stored as it is passed in, with no translation. Methods
 * to access characters convert the coordinates according to any specified
 * translations. The example below shows the conversion of the coordinate
 * marked with `X`:
 *
 * ```
 * Translated:                        As stored:
 * (0, 3)                             (1, 4)
 * # # # . #                          # . # # #
 * # # . . #                          . . # . .
 * # . # # # <- 1 flip, 1 rotation <- . # # . #
 * X . # . .                          . . . # .
 * # . . . #                          # X # # #
 * ```
 *
 * Converting coordinates from the translated matrix back to the original
 * orientation:
 *
 * 1. Repeat for each rotation:
 *    - `x = y0`
 *    - `y = max - x0`
 * 2. If the image is flipped, `x = max - x0`.
 *
 * In the example above, (0, 3) in the flipped and rotated matrix converts as
 * follows:
 * - `x`: `0` -> rotate -> `3` -> flip -> `1`
 * - `y`: `3` -> rotate -> `4` -> flip -> `4`
 *
 * @param {Array} chars - the characters in the matrix
 * @returns {Object} - the matrix object
 */
module.exports = chars => {
  const maxCoord = chars.length - 1;

  /**
   * Transforms the given coordinates according to the indicated number of flips
   * and rotations.
   * @param {number} flips - the number of flips to perform
   * @param {number} rotations - the number of rotations to perform
   * @param {Object} coords - the untransformed coordinates
   * @returns {Object} - the transformed coordinates
   */
  const transform = (flips, rotations, coords) => {
    let { x, y } = coords;
    rotations = rotations % 4;

    for (let i = 0; i < rotations; i++) {
      const newX = y;
      y = maxCoord - x;
      x = newX;
    }

    x = flips % 2 === 0 ? x : maxCoord - x;
    return { x, y };
  };

  const api = {
    /**
     * The size of the matrix.
     */
    size: chars.length,

    /**
     * Retrieves a character from the transformed matrix at the given
     * coordinates.
     *
     * @param {number} flips - the number of flips to perform
     * @param {number} rotations - the number of rotations to perform
     * @param {Object} coords - the coordinates of the character to retrieve from
     * the transformed matrix
     * @returns {string} - the character at those coordinates
     */
    get: (flips, rotations, coords) => {
      coords = transform(flips, rotations, coords);
      return chars[coords.y][coords.x];
    },
    /**
     * Sets a character in the transformed matrix at the given coordinates.
     *
     * @param {number} flips - the number of flips to perform
     * @param {number} rotations - the number of rotations to perform
     * @param {Object} coords - the coordinates of the character to set in the
     * transformed matrix
     * @param {string} chr - the character to write at those coordinates
     */
    set: (flips, rotations, coords, chr) => {
      coords = transform(flips, rotations, coords);
      chars[coords.y][coords.x] = chr;
    },

    /**
     * Counts the number of time a given character occurs in the matrix.
     *
     * @param {string} chr - the character to find
     * @returns {number} - how many times that character is found 
     */
    count: chr => add(chars.map(
      line => line.reduce((count, c) => count + (c === chr ? 1 : 0), 0)
    )),

    /**
     * Returns a string representation of the matrix, oriented as described.
     *
     * @param {number} [flips=0] - the number of flips to apply to the matrix
     * @param {number} [rotations=0] - the number of rotations to apply to the
     * matrix
     * @returns {string} - the string representation of the matrix
     */
    toString: (flips = 0, rotations = 0) => {
      const lines = [];

      for (let y = 0; y < chars.length; y++) {
        const row = [];

        for (let x = 0; x < chars.length; x++) {
          row.push(api.get(flips, rotations, { x, y }));
        }

        lines.push(
          row
            .map(chr => [chr === 'O' ? BRIGHT_GREEN : BLUE] + chr + RESET)
            .join('')
        );
      }

      return lines.join('\n');
    },
  };

  return api;
};
