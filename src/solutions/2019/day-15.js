const intcode = require('./intcode');
const InfiniteGrid = require('../infinite-grid');

// Represents the four possible directions the `Droid` can mvoe.
const DIRECTIONS = [
  { id: 1, delta: [ -1,  0 ], key: 'N' }, // north
  { id: 2, delta: [  1,  0 ], key: 'S' }, // south
  { id: 3, delta: [  0, -1 ], key: 'W' }, // west
  { id: 4, delta: [  0,  1 ], key: 'E' }, // east
];
DIRECTIONS[0].opposite = DIRECTIONS[1];
DIRECTIONS[1].opposite = DIRECTIONS[0];
DIRECTIONS[2].opposite = DIRECTIONS[3];
DIRECTIONS[3].opposite = DIRECTIONS[2];

// The possible responses from the `Droid`.
const Output = {
  WALL: 0,
  MOVED: 1,
  O2: 2,
};

// The various tiles that can be displayed in the debug output for the `Grid`.
// The `WALL`, `AIR`, `EMPTY`, and `UNKNOWN` tiles are also used to represent
// `Cell` contents.
const Tile = {
  DROID:   '🤖',
  O2:      '🏁',
  START:   '🚩',
  WALL:    '\u001b[37m██\u001b[0m',
  AIR:     '\u001b[34;1m░░\u001b[0m',
  PATH:    '\u001b[33;1m··\u001b[0m',
  EMPTY:   '  ',
  UNKNOWN: '\u001b[31;1m░░\u001b[0m',
};

/**
 * # [Advent of Code 2019 Day 15](https://adventofcode.com/2019/day/15)
 *
 * While you don't have to explore the entire space in part one, part two
 * requires it anyway, so there's no reason not to. Each location the droid can
 * go to is represented with an instance of the `Cell` class, which keeps track
 * of its coordinates and what it contains: one of `EMPTY`, `AIR`, `WALL`, or
 * `UNKNOWN`. Since the droid, the oxygen system and air can all be found at
 * the same location, their locations are tracked separately. The `Cell`s are
 * kept in an `InfiniteGrid` instance (which I've used previously). This is
 * handy because we start out not knowing where we are in relation to the rest
 * of the area, so we need to be able to expand in any direction, and we don't
 * know in advance how large the area will be.
 *
 * I wrapped the `InfiniteGrid` inside a `Grid` class, which is responsible for
 * creating new `Cell`s automatically when we ask for them, and initializing
 * their content to be unknown. When I attempt to move the droid into an
 * unknown `Cell`, I will learn whether or not it contains `WALL`, and this
 * class facilitates updating that information as well. As used by
 * `InfiniteGrid`, coordinates are represented as an array of numbers.
 *
 * The most important method, though, is `pathTo()`, which find the shortest
 * path between a known `Cell` to the closest `Cell` that fulfills a given
 * predicate. See the `pathTo()` method for details.
 *
 * I also created a `Droid` class, which is responsible for tracking the
 * droid's current position and moving it around.
 *
 * The steps for solving both parts are:
 *
 * 1. Explore the entire space. In so doing, I will at some point run across
 *    the O2 system, so I'll note its coordinates when I find it. See the
 *    documentation for the `explore()` function for more information.
 * 2. Determine the shortest path from the start location to the O2 system.
 *    The length of this path is the answer to part one. This simply reuses the
 *    `Grid.pathTo()` method used during `explore()`.
 * 3. Oxygenate the entire space. The amount of time required to do so is the
 *    answer to part two. See the documenation for `oxygenate()` for details.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { grid, o2 } = explore(input);
  const path = grid.pathTo([ 0, 0 ], cell => cell.coords[0] === o2[0] && cell.coords[1] === o2[1]);
  return [ path.directions.length, oxygenate(grid, o2) ];
};

/**
 * Moves the droid around to map out the entire space and locate the oxygen
 * system. The function returns an object with two properties:
 *
 * - `grid`: An `InfiniteGrid` instance representing the entire space
 * - `o2`: The coordinates of the oxygen system
 *
 * Algorithm:
 *
 *  1. Create a new, empty `Grid` and a `Droid`.
 *  2. If we currently have a path to follow, skip to step 4.
 *  3. Generate the path to the nearest `Cell` adjacent to an `UNKNOWN` `Cell`.
 *     If no such `Cell` can be found, the entire space has been explored;
 *     exit.
 *  4. If we're at our destination, skip to step 6.
 *  5. Move the droid in the direction indicated by our path, then remove that
 *     move from the path.
 *     - If we are stopped by a `WALL`, throw an `Error` (since we previously
 *       said there was no `WALL` there, so we must have a bug).
 *     - Otherwise, go back to step 2.
 *  6. Delete our path so it will be recomputed on the next iteration.
 *  7. Determine which adjacent `Cell`s are `UNKNOWN`. If there are none, throw
 *     an `Error` (since we previously said there was an `UNKNOWN` `Cell`
 *     adjacent to this `Cell`, so we must have a bug).
 *  8. Attempt to move the droid in the direction of the first `UNKNOWN`
 *     `Cell`. Mark the cell as `EMPTY` if the move was successful, otherwise
 *      mark it as `WALL`.
 *  9. If the oxygen system is here, record its coordinates.
 * 10. Go back to step 2.
 *
 * @param {string} program - the droid Intcode program
 * @returns {Object} - the results of the exploration
 */
const explore = program => {
  const grid = new Grid();
  const droid = new Droid(program);
  let o2, path;

  do {
    if (!path) {
      // Seek the nearest Cell adjacent to an unknown Cell
      path = grid.pathTo(
        droid.coords,
        cell => grid.getAdjacentDirectionsWithTile(
          cell.coords,
          Tile.UNKNOWN
        ).length
      );

      if (!path) {
        break; // area has been fully explored
      }
    }

    if (path.directions.length) {
      // We have a path; follow it
      const direction = path.directions.shift();
      path.cells.shift();
      const output = droid.move(direction);

      if (output === Output.WALL) {
        throw new Error('Unexpected wall');
      }
    } else {
      // We've reached our destination; attempt to move into the unknown Cell
      path = null;
      const adjacentUnknowns = grid.getAdjacentDirectionsWithTile(droid.coords, Tile.UNKNOWN);
      const direction = adjacentUnknowns[0];

      if (!direction) {
        throw new Error('Expected to find an unknown adjacent cell, but didn\'t')
      }

      const oldDroidCoords = droid.coords;
      const output = droid.move(direction);
      const hasWall = output === Output.WALL;
      grid.setWall(oldDroidCoords, direction, hasWall);

      if (output === Output.O2) {
        o2 = droid.coords; // We found the oxygen system!
      }
    }
  } while (true);

  return {
    grid,
    o2,
  };
};

/**
 * Floods the entire space with oxygen. The function returns the amount of time
 * it took to do so.
 *
 * Algorithm:
 *
 * 1. Set a time counter to `0`.
 * 2. Set the contents of the `Cell` where the oxygen system is located to
 *    `AIR`.
 * 3. Find all adjacent `EMPTY` cells and store them in a `Set` called
 *    `adjacentCells`.
 * 4. Create a new `Set` called `nextCells`.
 * 5. Iterate all the `Cell`s in `adjacentCells`:
 *    1. Set the contents of the `Cell` to `AIR`.
 *    2. Find all adjacent `EMPTY` cells and add them to `nextCells`.
 * 6. Replace `adjacentCells` with `nextCells`.
 * 7. Increment the time counter.
 * 8. If `adjacentCells` is not empty, go to step 4.
 * 9. Return the value in the time counter.
 *
 * @param {Grid} grid - the `Grid` created by `explore()`
 * @param {Array} o2 - the coordinates of the oxygen system
 * @returns {number} - time to oxygenate the entire space
 */
const oxygenate = (grid, o2) => {
  let time = 0;
  grid.get(o2).tile = Tile.AIR;
  let adjacentCells = new Set(grid.getAdjacentDirectionsWithTile(o2, Tile.EMPTY)
    .map(direction => getAdjacentCoords(o2, direction))
    .map(coords => grid.get(coords)));

  do {
    const nextCells = new Set();
    adjacentCells.forEach(cell => {
      cell.tile = Tile.AIR;
      grid.getAdjacentDirectionsWithTile(cell.coords, Tile.EMPTY).forEach(direction => {
        nextCells.add(grid.get(getAdjacentCoords(cell.coords, direction)));
      });
    });
    adjacentCells = nextCells;
    time++;
  } while (adjacentCells.size);

  return time;
};

/**
 * Represents the droid controlled by the Intcode program. Responsible for
 * sending it commands and receiving its responses, as well as tracking its
 * location.
 */
class Droid {
  #api;
  #state;
  coords = [ 0, 0 ];

  /**
   * Initializes the `Droid`.
   *
   * @param {string} program - the Intcode program for the `Droid`.
   */
  constructor(program) {
    const result = intcode(program);
    this.#api = result.api;
    this.#state = result.state;
  }

  /**
   * Moves the `Droid` in the given direction and returns the result. The
   * result values are enumerated in `Output`.
   *
   * @param {*} direction 
   * @returns 
   */
  move(direction) {
    this.#api.input(direction.id);
    this.#api.run();
    const result = this.#state.output.shift();

    if (result !== Output.WALL) {
      this.coords = getAdjacentCoords(this.coords, direction);
    }

    return result;
  }
}

/**
 * Represents the space the `Droid` explores. Uses an `InfiniteGrid` to store
 * `Cell`s.
 */
class Grid {
  #grid = new InfiniteGrid();

  /**
   * Constructs a new `Grid` with only one `EMPTY` `Cell` at `[ 0, 0 ]`.
   */
  constructor() {
    const home = new Cell([ 0, 0 ]);
    home.tile = Tile.EMPTY;
    this.#grid.put(home.coords, home);
  }

  /**
   * Retrieves the `Cell` at the given coordinates. If no `Cell` exists there,
   * a new `Empty` `Cell` is created.
   *
   * @param {Array} coords - the coordinates of the `Cell` to retrieve 
   * @returns {Cell} - the `Cell` at those coordinates
   */
  get(coords) {
    let cell = this.#grid.get(coords);

    if (!cell) {
      cell = new Cell(coords);
      this.#grid.put(coords, cell);
    }

    return cell;
  }

  /**
   * Updates an `UNKNOWN` `Cell` in response to the `Droid`'s attempt to move
   * into it.
   *
   * @param {Array} coords - the coordinates from which the `Droid` attempted
   * to move
   * @param {Object} direction - the direction in which the `Droid` attempted
   * to move 
   * @param {boolean} hasWall - whether the `Droid` was stopped by a wall 
   */
  setWall(coords, direction, hasWall) {
    const coords1 = getAdjacentCoords(coords, direction);
    const cell1 = this.get(coords1);
    cell1.tile = hasWall ? Tile.WALL : Tile.EMPTY;
  }

  /**
   * Finds the shortest path from the given coordinates to the nearest `Cell`
   * that matches the predicate. The predicate function receives the `Cell` as
   * its only argument, and returns `true` if the `Cell` is a match and `false`
   * if it is not. The returned object has the following properties:
   *
   * - `cells`: An array of `Cell` objects along the path, starting with the
   *   `Cell` at the given coordinates and ending with the `Cell` at the
   *    target coordinates.
   * - `directions`: An array of direction objects describing the commands to
   *    give to the `Droid` to move to the target `Cell`. If the target `Cell`
   *    is the same as the starting `Cell`, the array will be empty.
   *
   * Algorithm:
   *
   * We preform a breadth-first search to ensure that the matched `Cell` is the
   * nearest possible match.
   *
   * 1. Create a search queue containing one entry representing the starting
   *    `Cell`. The queued object stores the list of `Cell`s along the path so
   *    far (right now, just the starting `Cell`) and the list of directions
   *    moved (empty).
   * 2. Loop while the queue is not empty:
   *    1. Take an entry from the queue.
   *    2. The current `Cell` is the last element in the entry's `cells` array.
   *    3. Test the current `Cell` against the predicate. If it matches, return
   *       the entry.
   *    4. Find all `Cell`s adjacent to the current `Cell` that are `EMPTY` and
   *       which are not contained in the entry's `cells` array.
   *    5. For each adjacent `Cell`, enqueue a new entry. The `cells` array in
   *       the entry should be a copy of the one from the current entry, with
   *       the adjacent `Cell` appended. The `directions` array should be a
   *       copy of the one from the current entry, with the direction from the
   *       current `Cell` to the adjacent `Cell` appended.
   * 3. If we empty the queue, there is no path to any `Cell` that matches the
   *    predicate.
   *
   * @param {Function} predicate - the predicate to match
   * @returns {Object|null} - the path object, or `null` if no cell was found
   */
  pathTo(coords, predicate) {
    let queue = [
      {
        cells: [ this.get(coords) ],
        directions: [],
      },
    ];

    while (queue.length) {
      const entry = queue.shift();
      const cell = entry.cells[entry.cells.length - 1];

      if (predicate(cell)) {
        return entry; // Found a match!
      }

      this.getAdjacentDirectionsWithTile(cell.coords, Tile.EMPTY).forEach(direction => {
        const adjacentCoords = getAdjacentCoords(cell.coords, direction);
        const adjacentCell = this.get(adjacentCoords);

        if (entry.cells.includes(adjacentCell)) {
          return;
        }

        queue.push({
          cells: [ ...entry.cells, adjacentCell ],
          directions: [ ...entry.directions, direction ],
        })
      });
    }

    return null;
  }

  /**
   * Finds adjacent `Cell`s which contain the indicated tile.
   *
   * @param {Array} coords - the coordinates of the starting `Cell`
   * @param {string} tile - the tile to match
   * @returns {Array} - a list of direction objects pointing to adjacent
   * `Cell`s which contain the indicated tile
   */
  getAdjacentDirectionsWithTile(coords, tile) {
    return DIRECTIONS.filter(direction => {
      const adjacentCoords = getAdjacentCoords(coords, direction);
      return this.get(adjacentCoords).tile === tile;
    });
  }

  /**
   * Returns a graphical representation of the `Grid` that can be printed to
   * the console for debugging purposes. All arguments are optional, but will
   * decorate the output with additional information if provided.
   *
   * @param {Array} droidCoords - the current location of the `Droid`
   * @param {Array} o2Coords - the coordinates of the oxygen system
   * @param {Object} path - a path as returned by the `pathTo` method
   * @returns {string} - a string representation of the `Grid`
   */
  toString(droidCoords, o2Coords, path) {
    const droidCoordsStr = droidCoords?.join();
    const o2coordsStr = o2Coords?.join();
    const pathCells = path?.cells.map(cell => cell.coords.join()) ?? [];
    const lines = [];
    let line;
    let rLast;
    this.#grid.forEach((coords, cell) => {
      if (coords[0] !== rLast) {
        if (line) {
          lines.push(line.join(''));
        }

        line = [];
        rLast = coords[0];
      }

      const coordsStr = coords.join();

      if (coordsStr === droidCoordsStr) {
        line.push(Tile.DROID);
      } else if (coordsStr === o2coordsStr) {
        line.push(Tile.O2);
      } else if (coordsStr === '0,0') {
        line.push(Tile.START);
      } else if (pathCells.includes(coordsStr)) {
        line.push(Tile.PATH);
      } else {
        line.push(cell?.tile ?? Tile.UNKNOWN);
      }
    });

    lines.push(line.join(''));
    return lines.join('\n');
  }
}

/**
 * Returns the coordinates which are adjacent to the given coordinates in the
 * named direction.
 *
 * @param {Array} coords - the starting coordinates
 * @param {Object} direction - the direction to look
 * @returns {Array} - the adjacent coordinates
 */
const getAdjacentCoords = (coords, direction) => direction.delta
  .map((deltaCoord, i) => coords[i] + deltaCoord);

/**
 * Represents a cell in the grid. Knows its own coordinates and can contain
 * `EMPTY`, `WALL`, `AIR`, or `UNKNOWN`.
 */
class Cell {
  coords;
  tile = Tile.UNKNOWN;

  /**
   * Creates a new `Cell` with the given coordinates. Starts out containing
   * `UNKNOWN`.
   *
   * @param {Array} coords - the coordinates of the cell
   */
  constructor(coords) {
    this.coords = coords;
  }
}
