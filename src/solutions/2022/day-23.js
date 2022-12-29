const InfiniteGrid = require('../infinite-grid');

// 0 1 2
// 3   4
// 5 6 7
const SCANS = [
  { check: [ 0, 1, 2 ], move: [ -1, 0 ] },
  { check: [ 5, 6, 7 ], move: [ 1, 0 ] },
  { check: [ 0, 3, 5 ], move: [ 0, -1 ] },
  { check: [ 2, 4, 7 ], move: [ 0, 1 ] },
];

/**
 * # [Advent of Code 2022 Day 23](https://adventofcode.com/2022/day/23)
 *
 * There wasn't anything mysterious about this puzzle; it was more about making sure you precisely
 * implemented the described rules. My `InfiniteGrid` class was invaluable for this, since it
 * handles the expanding size of the grid easily and already provides an easy way to get the bounds
 * of the elements in the grid. It also had two other methods which were particularly useful:
 *
 * - `forEachSparse()`: Iterates the occupied cells in the grid
 * - `forEachNear()`: Iterates all cells surrounding a specified cell
 *
 * These two methods together made it easy to iterate all the elves in the grid and examine the
 * cells immediately adjacent to them. The scans were represented by objects that indicated which
 * adjacent cells to check, and gives coordinate deltas for the movement proposal should the scan
 * pass. They're stored in an array in the initial specified order, and with each step, we
 * `shift()` a scan object off the top of the array and `push()` it onto the bottom.
 *
 * I performed both parts of the puzzle in a single pass. After ten steps, I retrieved the bounds
 * of the elves in the grid and multiplied its width and height, then subtracted the number of
 * elves. This gives the answer to part one. Then I continue the simulation until a step results in
 * no movement. The number of steps performed is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let grid = parse(input);
  const scans = [ ...SCANS ];
  let emptyAtTenSteps;
  let steps = 0, moved;

  do {
    const result = step(grid, scans);
    scans.push(scans.shift());
    grid = result.grid;
    moved = result.moved;
    steps++;

    if (steps === 10) {
      const bounds = grid.getBounds();
      const rows = bounds[0].max - bounds[0].min + 1;
      const cols = bounds[1].max - bounds[1].min + 1;
      emptyAtTenSteps = rows * cols - grid.size;
    }
  } while (moved);

  return [ emptyAtTenSteps, steps ];
};

/**
 * Produces an `InfiniteGrid` containing the initial locations of the elves.
 *
 * @param {string} input - the puzzle input
 * @returns {InfiniteGrid} - the grid
 */
const parse = input => {
  input = input.replaceAll('\r', '');
  const grid = new InfiniteGrid();
  let coords = [ 0, 0 ];

  for (let i = 0; i < input.length; i++) {
    const chr = input.charAt(i);

    if (chr === '\n') {
      coords[0]++;
      coords[1] = 0;
    } else {
      if (chr === '#') {
        grid.put(coords, '#');
      }

      coords[1]++;
    }
  }

  return grid;
};

/**
 * Performs a single step in the simulation. The return value is an object that describes the
 * result of the step, with two properties:
 *
 * - `grid`: An updated `InfiniteGrid`
 * - `moved`: A `boolean` indicating whether any elves moved
 *
 * @param {InfiniteGrid} grid - the grid
 * @param {Array<Object>} scans - the scans in the order for this step
 * @returns {Object} - the result object
 */
const step = (grid, scans) => {
  const proposals = makeProposals(grid, scans);
  const collisions = detectCollisions(proposals);
  return moveElves(proposals, collisions);
};

/**
 * Collects the elves' movement proposals into a `Map`. The key is a string consisting of the
 * concatenated coordinates of an elf's current location, and the value is an array representing
 * the coordinates to where the elf wishes to move. (This will be the same as its current position
 * if the elf does not propose to move.)
 *
 * A scan object indicates which cells should be examined and the direction to move if the scan
 * passes. See the `SCANS` constant at the top of the file to see what this looks like.
 *
 * @param {InfiniteGrid} grid - the grid
 * @param {Array<Object>} scans - the scans in the order for this step
 * @returns {Map<string, Array<number>>} - the movement proposals
 */
const makeProposals = (grid, scans) => {
  const proposals = new Map();
  grid.forEachSparse(coords => {
    const near = [];
    let alone = true;
    grid.forEachNear(coords, (_, adjValue) => {
      if (adjValue) {
        alone = false;
      }

      near.push(adjValue);
    }, { omitSelf: true });

    if (alone) {
      proposals.set(coords.join(','), coords);
    } else {
      const scan = scans.find(scan => scan.check.every(index => near[index] === undefined));
      const proposal = scan ? coords.map((coord, i) => coord + scan.move[i]) : coords;
      proposals.set(coords.join(','), proposal);
    }
  });
  return proposals;
};

/**
 * Finds all instances where two elves propose to move to the same location, and returns a `Set`
 * containing the concatenated coordinates of all such collisions.
 *
 * @param {Map<string, Array<number>>} proposals - the proposal `Map`
 * @returns {Set<string>} - the collisions
 */
const detectCollisions = proposals => {
  const seen = new Set(), collisions = new Set();
  [ ...proposals.values() ].forEach(coords => {
    const key = coords.join(',');
    (seen.has(key) ? collisions : seen).add(key);
  });
  return collisions;
};

/**
 * Moves the elves according to the given proposals, except for those whose destination matches one
 * of the collision locations. The function returns the result object expected to be returned by
 * `step()`.
 *
 * @param {Map<string, Array<number>>} proposals - the proposal `Map`
 * @param {Set<string>} collisions - the collisions
 * @returns {Object} - the result
 */
const moveElves = (proposals, collisions) => {
  let moved = false;
  const grid = new InfiniteGrid();
  proposals.forEach((target, sourceKey) => {
    const newPos = collisions.has(target.join(',')) ? sourceKey.split(',').map(Number) : target;
    moved = moved || newPos.join(',') !== sourceKey;
    grid.put(newPos, '#');
  });
  return { grid, moved };
};
