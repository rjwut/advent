const SimpleGrid = require('../simple-grid');

const DIRECTIONS = [
  { r: -1, c:  0 },
  { r:  0, c:  1 },
  { r:  1, c:  0 },
  { r:  0, c: -1 },
];

/**
 * # [Advent of Code 2024 Day 6](https://adventofcode.com/2024/day/6)
 *
 * Part 1 was pretty straightforward: simulate the guard's patrol until she left the grid, put each
 * position she occupied into a set, then the size of the set is the answer. For part 2, you have to
 * be able to stop the simulation when the guard goes into a loop. This is easily determined: if at
 * any point the guard is at the same location and facing the same way as any previous time during
 * her patrol, she's in a loop. So I added that to the simulation runner. While you could then try
 * an obstruction in every open cell in the grid, the only places where an obstruction could change
 * her path would be locations she actually visited in the initial simulation run. We're already
 * collecting those locations for part 1, so that's easy. We simply remove her start location, then
 * run another simulation for each of the remaining locations, counting how many go into a loop when
 * an obstruction is placed there. That was the answer to part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  // Part 1: Build the grid and perform the initial simulation
  const grid = new SimpleGrid({ data: input });
  grid.startCoords = grid.coordsOf('^');
  const { visited } = simulate(grid);
  const part1 = visited.size;

  // Part 2: Remove the start location from the list of visited cells, then try placing an
  // obstruction in each of the remaining locations to see if it causes the guard to loop.
  visited.delete(`${grid.startCoords.r},${grid.startCoords.c}`);
  const part2 = [ ...visited ]
    .map(pos => pos.split(',').map(Number))
    .filter(([ r, c ]) => testObstructionLocation(grid, r, c))
    .length;
  return [ part1, part2 ];
};

/**
 * Performs a simulation run of the guard's patrol using the given `SimpleGrid`, then returns an
 * object describing the results:
 *
 * - `loop: boolean`: Whether the guard entered a loop.
 * - `visited: Set<string>`: The cells the guard visited in the course of the simulation in
 *   `<r>,<c>` format.
 *
 * @param {SimpleGrid} grid - the grid representing the lab
 * @returns {Object} - the simulation results
 */
const simulate = grid => {
  let { r, c } = grid.startCoords;
  let dirIndex = 0;
  const visited = new Set();    // cells the guard visits
  const seenStates = new Set(); // states the guard is in (like visited, but includes direction)
  let loop = false;

  do { // simulation loop
    const coords = `${r},${c}`;
    visited.add(coords);
    const state = `${coords},${dirIndex}`;

    if (seenStates.has(state)) {
      // We've seen this state before, so we're in a loop.
      loop = true;
      break;
    }

    seenStates.add(state);
    // Get the cell in front of the guard's current position.
    const dir = DIRECTIONS[dirIndex];
    const rNext = r + dir.r;
    const cNext = c + dir.c;

    if (!grid.inBounds(rNext, cNext)) {
      break; // Guard has left the grid; end the simulation.
    }

    if (grid.get(rNext, cNext) === '#') {
      // Path is obstructed; turn right.
      dirIndex = (dirIndex + 1) % 4;
    } else {
      // Step forward.
      r = rNext;
      c = cNext;
    }
  } while (true);

  return { loop, visited };
};

/**
 * Given a candidate location for an obstruction to be placed on the grid, determine whether it
 * causes the guard to go into a loop.
 *
 * @param {SimpleGrid} grid - the grid representing the lab
 * @param {number} r - the row coordinate where the obstruction is to be placed
 * @param {number} c - the column coordinate where the obstruction is to be placed
 * @returns {boolean} - whether the obstruction causes the guard to loop
 */
const testObstructionLocation = (grid, r, c) => {
  // Clone the grid and place the obstruction at the candidate location.
  const gridCopy = grid.clone();
  gridCopy.set(r, c, '#');
  gridCopy.startCoords = grid.startCoords;
  // Run the simulation to test the obstruction.
  return simulate(gridCopy).loop;
};
