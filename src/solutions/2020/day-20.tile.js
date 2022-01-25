/**
 * Assign numbers to the four cardinal directions and letters to the four
 * corners of a tile:
 *
 * ```
 *            0 = north
 *          a---b
 * west = 3 |   | 1 = east
 *          d---c
 *            2 = south
 * ```
 *
 * An edge is named for the corners it connects. The order the edge is
 * traversed is indicated by the order of the letters: to traverse `bc` in the
 * opposite direction, the edge name is `cb`.
 *
 * Tiles can be rotated and flipped:
 *
 * ```
 * a---b            b---a                 c---b
 * |   | -> flip -> |   | -> rotate 90 -> |   |
 * d---c            c---d                 d---a
 * ```
 * 
 * This makes eight possible orientations:
 *
 * ```
 *        Rotations
 * Flips    0      1      2      3
 *        a---b  d---a  c---d  b---c
 *     0  |   |  |   |  |   |  |   |
 *        d---c  c---b  b---a  a---d
 * 
 *        b---a  c---b  d---c  a---d
 *     1  |   |  |   |  |   |  |   |
 *        c---d  d---a  a---b  b---c
 * ```
 *
 * For each tile, generate the eight possible edge permutations: `ab`, `bc`,
 * `cd`, `da`, `ba`, `cb`, `dc`, and `ad`.
 */
const buildMatrix = require('./day-20.matrix');

const EDGE_TRANSFORMATIONS = [
  //   N     E     S     W
  [ // --------------------------- unflipped
    [ 'ab', 'bc', 'dc', 'ad' ], // 0 rotations
    [ 'da', 'ab', 'cb', 'dc' ], // 1 rotations
    [ 'cd', 'da', 'ba', 'cb' ], // 2 rotations
    [ 'bc', 'cd', 'ad', 'ba' ], // 3 rotations
  ],
  [ // --------------------------- flipped
    [ 'ba', 'ad', 'cd', 'bc' ], // 0 rotations
    [ 'cb', 'ba', 'da', 'cd' ], // 1 rotations
    [ 'dc', 'cb', 'ab', 'da' ], // 2 rotations
    [ 'ad', 'dc', 'bc', 'ab' ], // 3 rotations
  ],
];

/**
 * Parses an individual tile and returns an object representing it. The tile
 * object has the following properties:
 *
 * - `id` (number): The tile's ID.
 * - `size` (number): The width and height of the tile.
 * - `matrix` (object): The matrix of characters for this tile.
 * - `getEdge(flips, rotations, direction)`: Returns a string representing the
 *   tile edge facing the indicated direction AFTER it has been flipped and
 *   rotated.
 *
 * @param {string} input - the input string for a single tile
 * @returns {Object} - the tile object
 */
module.exports = input => {
  const idLine = input[0];
  const id = parseInt(idLine.substring(5, idLine.length - 1), 10);
  const lines = input.slice(1);
  const size = lines.length;
  const chars = lines.map(line => [ ...line ]);
  const matrix = buildMatrix(chars);
  const maxCoord = size - 1;
  const left = [], right = [];

  for (let i = 0; i < size; i++) {
    const row = chars[i];
    left.push(row[0]);
    right.push(row[maxCoord]);
  }

  const edges = {
    ab: lines[0],
    ad: left.join(''),
    bc: right.join(''),
    dc: lines[maxCoord],
  };
  edges.ba = reverse(edges.ab);
  edges.da = reverse(edges.ad);
  edges.cb = reverse(edges.bc);
  edges.cd = reverse(edges.dc);

  return {
    id,
    size,
    matrix,
    /**
     * Returns a string representing the tile edge facing the indicated
     * direction AFTER it has been flipped and rotated.
     *
     * @param {number} flips - the number of times the tile has been flipped,
     * before any rotations
     * @param {number} rotations - the number of times the tile has been rotated 90
     * degrees clockwise (after any flips)
     * @param {number} direction - a number indicating which direction the desired
     * edge faces: 0 = north, 1 = east, 2 = south, 3 = west
     * @returns {string} - the edge
     */
    getEdge: (flips, rotations, direction) =>
      edges[EDGE_TRANSFORMATIONS[flips % 2][rotations % 4][direction]],
  };
};

/**
 * Reverses a string.
 *
 * @param {string} str - the string to reverse
 * @returns {string} - the reversed string
 */
const reverse = str => [ ...str ].reverse().join('');
