/**
 * The grid holds all the cells for the tiles placed on it. Each cell tracks
 * the position, orientation, and neighbors of each tile.
 * 
 * A new grid is created with an arbitrary tile placed at (0,0). Tiles may be
 * added at any coordinate, including negative coordinates. A bounds object is
 * used to keep a bounding rectangle around the tiles. Because the grid can be
 * expanded in any direction, we store the cells in a `Map` keyed on the cell
 * coordinates, rather than a two-dimensional array.
 */
const buildBounds = require('./day-20.bounds');
const buildMatrix = require('./day-20.matrix');

const DIRECTIONS = [
  coords => ({ x: coords.x,     y: coords.y - 1 }), // north
  coords => ({ x: coords.x + 1, y: coords.y     }), // east
  coords => ({ x: coords.x,     y: coords.y + 1 }), // south
  coords => ({ x: coords.x - 1, y: coords.y     }), // west
];

/**
 * Returns an object representing tiles placed (in any orientation) in a grid.
 * The grid starts with a single "origin tile", which is not transformed, then
 * additional tiles can be added to it.
 *
 * @param {Object} originTile - the tile object with which to start the grid 
 * @returns {Object} - the grid object
 */
const buildGrid = originTile => {
  const origin = buildCell(originTile, { x: 0, y: 0 }, 0, 0);
  const bounds = buildBounds();
  const cellMap = new Map();
  cellMap.set(origin.key, origin);
  const grid = {
    /**
     * The cell containing the origin tile.
     */
    origin,

    /**
     * Retrieves the cell located at the given coordinates.
     *
     * @param {Object} coords - the coordinates of the cell
     * @returns {object|undefined} - the cell at those coordinates, or
     * `undefined` if no cell is located there
     */
    get: coords => cellMap.get(`${coords.x},${coords.y}`),

    /**
     * Places a tile in the grid and returns the new cell.
     *
     * @param {Object} coords - the coordinates where the tile should be placed
     * @param {Object} tile - the tile object to place there
     * @param {number} flips - how many flips to apply to the tile
     * @param {number} rotations - how many rotations to apply to the tile
     * @returns {Object} - the new cell
     */
    set: (coords, tile, flips, rotations) => {
      const cell = buildCell(tile, coords, flips, rotations);
      cellMap.set(cell.key, cell);
      bounds.put(coords);

      for (let direction = 0; direction < 4; direction++) {
        const neighborCoords = DIRECTIONS[direction](coords);
        const neighbor = grid.get(neighborCoords);

        if (neighbor) {
          cell.setNeighbor(direction, neighbor);
        }
      }

      return cell;
    },

    /**
     * Retrieves the four corner cells of the assembled grid.
     *
     * @returns {Array} - the corner cells
     */
    getCorners: () => {
      const minMax = bounds.get();
      return [
        { x: minMax.x.min, y: minMax.y.min },
        { x: minMax.x.max, y: minMax.y.min },
        { x: minMax.x.min, y: minMax.y.max },
        { x: minMax.x.max, y: minMax.y.max },
      ].map(coords => grid.get(coords));
    },

    /**
     * Returns a single matrix with all the tiles joined together and their
     * borders trimmed off.
     *
     * @returns {Object} - the matrix object representing the final image
     */
     toMatrix: () => {
      const tileSize = Array.from(cellMap.values())[0].tile.size - 2;
      const boundsInfo = bounds.get();
      const mapSize = boundsInfo.w * tileSize;
      const matrix = new Array(mapSize);

      for (let i = 0; i < mapSize; i++) {
        matrix[i] = new Array(mapSize);
      }

      bounds.iterate(coords => {
        const cell = cellMap.get(`${coords.x},${coords.y}`);
        const xCell = tileSize * (coords.x - boundsInfo.x.min);
        const yCell = tileSize * (coords.y - boundsInfo.y.min);

        for (let yTile = 1; yTile <= tileSize; yTile++) {
          const y = yCell + yTile - 1;
          const row = matrix[y];

          for (let xTile = 1; xTile <= tileSize; xTile++) {
            const x = xCell + xTile - 1;
            row[x] = cell.getCharAt({ x: xTile, y: yTile });
          }
        }
      });
      return buildMatrix(matrix);
    },

    /**
     * Returns a string representation of the grid, with tile borders intact.
     *
     * @returns {string}
     */
    toString: () => {
      const minMax = bounds.get();
      const tileSize = [ ...cellMap.values() ][0].tile.size;
      const mapWidth = (tileSize + 1) * minMax.w - 1;
      const mapHeight = (tileSize + 1) * minMax.h - 1;
      const map = new Array(mapHeight);

      for (let y = 0; y < mapHeight; y++) {
        const row = new Array(mapWidth);
        row.fill(' ');
        map[y] = row;
      }

      bounds.iterate(cellCoords => {
        const cell = cellMap.get(`${cellCoords.x},${cellCoords.y}`);

        if (!cell) {
          return;
        }

        const xCell = cellCoords.x - minMax.x.min;
        const yCell = cellCoords.y - minMax.y.min;

        for (let y = 0; y < cell.tile.size; y++) {
          const yMap = yCell * (tileSize + 1) + y;
          const row = map[yMap];

          for (let x = 0; x < cell.tile.size; x++) {
            const xMap = xCell * (tileSize + 1) + x;
            row[xMap] = cell.getCharAt({ x, y });
          }
        }
      });
      return map.map(row => row.join('')).join('\n');
    },
  };
  return grid;
};

/**
 * Creates a new cell and links it with its neighbors.
 *
 * @param {Object} tile - the tile to insert into the cell
 * @param {Object} coords - the grid coordinates where the tile should be
 * placed
 * @param {number} flips - the number of flips to apply to the tile
 * @param {number} rotations - the number of rotations to apply to the tile
 * @returns {cell} - the new cell
 */
const buildCell = (tile, coords, flips, rotations) => {
  const key = `${coords.x},${coords.y}`;
  const neighbors = [ null, null, null, null ];
  const cell = {
    /**
     * The tile contained in this cell.
     */
    tile,

    /**
     * The key for this cell.
     */
    key,

    /**
     * The coordinates for this cell.
     */
    coords: { ...coords },

    /**
     * Returns the tile edge in the indicated direction, taking into account
     * the tile's orientation.
     *
     * @param {number} direction - the direction of the desired edge 
     * @returns {string} - the string representation of the edge
     */
    getEdge: direction => tile.getEdge(flips, rotations, direction),

    /**
     * Returns the cell located adjacent to this cell in the indicated
     * direction, if any.
     *
     * @param {number} direction - the direction to look for a neighbor 
     * @returns {object|undefined} - the neighboring cell, or `undefined` if no
     * cell exists in that direction
     */
    getNeighbor: direction => neighbors[direction],

    /**
     * Registers a cell as a neighbor to this cell in the indicated direction.
     *
     * @param {number} direction - the direction of the neighbor cell
     * @param {Object} neighbor - the new neighbor cell 
     * @param {boolean} reciprocate - whether to create a reciprocal
     * relationship in the other direction
     */
    setNeighbor: (direction, neighbor, reciprocate = true) => {
      neighbors[direction] = neighbor;

      if (reciprocate) {
        neighbor.setNeighbor((direction + 2) % 4, cell, false);
      }
    },

    /**
     * Returns the character located at the coordinates on the tile, taking
     * flips and rotations into account.
     *
     * @param {Object} coords - the x,y coordinate of the character
     * @returns {string} - the character at that location
     */
     getCharAt: coords => tile.matrix.get(flips, rotations, coords),

    /**
     * Sets the character located at the coordinates on the tile, taking flips
     * and rotations into account.
     *
     * @param {Object} coords - the x,y coordinate of the character
     * @param {string} chr - the character to write
     */
    setCharAt: (coords, chr) => tile.matrix.set(flips, rotations, coords, chr),
  };
  return cell;
};
buildGrid.DIRECTIONS = DIRECTIONS;
module.exports = buildGrid;
