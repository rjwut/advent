const { split } = require('../util');

const DIRECTIONS_REGEXP = /nw|ne|sw|se|w|e/g;
const DELTAS = {
  Y_IS_ODD: {
    nw: [ -1,  1 ],
    ne: [  0,  1 ],
     w: [ -1,  0 ],
     e: [  1,  0 ],
    sw: [ -1, -1 ],
    se: [  0, -1 ],
  },
  Y_IS_EVEN: {
    nw: [  0,  1 ],
    ne: [  1,  1 ],
     w: [ -1,  0 ],
     e: [  1,  0 ],
    sw: [  0, -1 ],
    se: [  1, -1 ],
  },
};
const NUMBER_OF_DAYS = 100;

/**
 * # [Advent of Code 2020 Day 24](https://adventofcode.com/2020/day/24)
 *
 * This puzzle requires us to store a hexagonal grid. The difficulty is in how
 * to store and address it, because 1) arrays lend themselves to square grids,
 * and 2) the grid is potentially infinite in any direction.
 *
 * The solution to the infinite grid issue is similar to how we've handled it
 * in previous problems: store the coordinates of black tiles in a `Set`
 * instead of storing tile state in arrays. To create coordinates for a hex
 * grid, we can shift every other row of tiles horizontally by half a tile. The
 * diagrams below illustrate this: each letter represents a tile, and the lines
 * represent the adjacency relationships between them:
 *
 * ```txt
 *                                 -1     0     1     2
 *    \ /   \ /   \ /                   \ |   \ |   \ |
 * ----A-----B-----C-  ======>   1       -A-----B-----C-
 *    / \   / \   / \   shift           / |   / |   /
 * \ /   \ /   \ /                  | /   | /   | /
 * -D-----E-----F----            0 -D-----E-----F-
 * / \   / \   / \                  | \   | \   | \
 *    \ /   \ /   \ /                   \ |   \ |   \
 * ----G-----H-----I-  ======>  -1       -G-----H-----I-
 *    / \   / \   / \   shift           / |   / |   /
 * \ /   \ /   \ /                  | /   | /   | /
 * -J-----K-----L----           -2 -J-----K-----L-
 * / \   / \   / \                  | \   | \   | \
 * ```
 *
 * In the example section of grid above, the odd-numbered Y coordinates have
 * been shifted half a tile to the right, causing all the tiles to line up in a
 * square grid. We can now use Cartesian coordinates to address them; for
 * example, tile E is located at (0,0). By examining this grid, you can
 * determine the X and Y deltas for moving to a neighboring tile in the grid.
 * Note that the deltas change depending on whether the current Y coordinate is
 * odd or even:
 *
 * |    |    odd|  even|
 * |---:|------:|-----:|
 * |  nw| (-1,1)| (0,1)|
 * |  ne|  (0,1)| (1,1)|
 * |   w| (-1,0)|(-1,0)|
 * |   e|  (1,0)| (1,0)|
 * |  sw|(-1,-1)|(0,-1)|
 * |  se| (0,-1)|(1,-1)|
 *
 * All tiles are white on one side and black on the other, and they all start
 * with the white side facing up. Part one gives us a list of paths (each of
 * which consists of a list of directions from the origin tile) to tiles which
 * should be flipped over, and asks how many tiles are black afterward. Since a
 * single tile may get flipped multiple times, we can't just count the number
 * of paths. So we start at (0, 0), and for each direction in the path, look up
 * the corresponding delta and add it to the coordinate. We continue until we
 * reach the end of the path: that is the tile to flip. Then we look up that
 * coordinate in the `Set`; if it's absent, add it; if it's present, remove it.
 * At the end, the number of coordinates stored in the `Set` is the number of
 * black tiles.
 * 
 * Part two turns this into another
 * [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
 * simulation. We've done that before, so it's not too hard. We could figure
 * out what tiles to check by using bounds tracking like we've done before, but
 * in this case I chose to create a `Set` of tiles to check by putting all
 * black tiles in the `Set`, then all neighbors of those tiles. This will have
 * a performance benefit if the grid is sparse, but might be more expensive for
 * dense grids.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = buildGrid(parse(input));
  const startingBlackTileCount = grid.count();

  for (let i = 1; i <= NUMBER_OF_DAYS; i++) {
    step(grid);
  }

  const endingBlackTileCount = grid.count();
  return [ startingBlackTileCount, endingBlackTileCount ];
};

/**
 * Parses the puzzle input as an array of paths, where each path is an array of
 * directions.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the path array
 */
const parse = input => split(input).map(parseLine);

/**
 * Parses a single line of puzzle input into an array of directions.
 *
 * @param {string} line - a line of puzzle input
 * @returns {Array} - the directions that compose the path
 */
const parseLine = line => Array.from(line.matchAll(DIRECTIONS_REGEXP)).map(dir => dir[0]);

/**
 * Executes the given moves list and returns an object representing the grid
 * after those instructions are executed.
 *
 * @param {Array} movesList - a list of moves arrays 
 * @returns {Object} - the grid object
 */
const buildGrid = movesList => {
  let tiles = new Set();
  let nextTiles = new Set();
  const grid = {
    /**
     * Returns whether the tile with the given key is black.
     * @param {string} key - the key of the tile to check
     * @returns {boolean} - `true` if the tile is black, `false` otherwise
     */
    isBlack: key => tiles.has(key),

    /**
     * Sets the tile with the given key to be flipped. Note that the tile will
     * not actually be flipped until `finalize()` is called.
     * @param {string} key - the key of the tile to flip
     */
    flip: key => {
      if (nextTiles.has(key)) {
        nextTiles.delete(key);
      } else {
        nextTiles.add(key);
      }
    },

    /**
     * Applies all previous calls to `flip()`.
     */
    finalize: () => {
      tiles = nextTiles;
      nextTiles = new Set(tiles);
    },

    /**
     * Returns the number of black tiles.
     * @returns {number}
     */
    count: () => tiles.size,

    /**
     * Returns the number of black tiles that are adjacent to the tile with the
     * given key.
     * @param {string} key - the key of the tile to check
     * @returns {number} - the number of adjacent black tiles
     */
    countAdjacentBlackTiles: key => getAdjacent(key)
      .reduce((count, neighborKey) => count + grid.isBlack(neighborKey), 0),

    /**
     * Returns a Set containing the keys for every black tile, and every white
     * tile that has at least one adjacent black tile.
     */
    getBlackTilesAndNeighbors: () => {
      const set = new Set(tiles);
      [ ...set.values() ].forEach(key => {
        getAdjacent(key).forEach(neighbor => {
          set.add(neighbor);
        });
      });
      return set;
    },
  };
  movesList.forEach(moves => grid.flip(movesToKey(moves)));
  grid.finalize();
  return grid;
};

/**
 * Advances the one step according to the simulation rules.
 *
 * @param {Object} grid - the grid object
 */
const step = grid => {
  const tilesToCheck = grid.getBlackTilesAndNeighbors();
  [ ...tilesToCheck.values() ].forEach(key => {
    const isBlack = grid.isBlack(key);
    const count = grid.countAdjacentBlackTiles(key);

    if (isBlack && (count === 0 || count > 2)) {
      grid.flip(key);
    } else if (!isBlack && count === 2) {
      grid.flip(key);
    }
  });
  grid.finalize();
};

/**
 * Returns the key for the coordinates of the tile located at the end of the
 * given chain of moves.
 *
 * @param {Array} moves - the move chain
 * @returns {string} - the resulting coordinate key
 */
const movesToKey = moves => moves.reduce((coords, move) => {
  const delta = getDeltas(coords)[move];
  return [ coords[0] + delta[0], coords[1] + delta[1] ];
}, [ 0, 0 ]).join();

/**
 * Returns the keys of all tiles adjacent to the tile with the given key.
 *
 * @param {string} key - the key for the tile 
 * @returns {Array} - the keys of all neighboring tiles
 */
const getAdjacent = key => {
  const coords = keyToCoords(key)
  return Object.values(getDeltas(coords))
    .map(delta => `${coords[0] + delta[0]},${coords[1] + delta[1]}`);
};

/**
 * Returns the directional deltas for the given coordinates.
 *
 * @param {number} coords - the coordinates
 * @returns {Object} - directional deltas
 */
const getDeltas = coords => DELTAS[coords[1] % 2 === 0 ? 'Y_IS_EVEN' : 'Y_IS_ODD'];

/**
 * Returns the coordinates corresponding to the given key.
 *
 * @param {string} key - the key
 * @returns {Array} - the coordinates
 */
const keyToCoords = key => key.split(',').map(coord => parseInt(coord, 10));
