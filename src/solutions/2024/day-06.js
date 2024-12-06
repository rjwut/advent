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
 * an obstruction in every open cell in the grid, the only places where one would matter is in a
 * cell that is directly in front of one of the guard's positions in her initial run. Since we're
 * now tracking their past states during the run to detect loops, I just made it so the simulation
 * returned that, too. For each position in her initial run, I checked whether the cell directly in
 * front of her was open, and if so, stored that as a candidate location for an obstruction. Because
 * she might face the same cell from different directions, there would be some duplicates, so I
 * stored them in a set to ensure that positions were unique. After that, I simply iterated the
 * candidate locations, placing the obstruction there and running the simulation for each one, and
 * counted the runs that looped. That was the answer to part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });
  grid.startCoords = grid.coordsOf('^');
  const { states, visited } = simulate(grid);
  const loops = findLoops(grid, states);
  return [ visited, loops ];
};

/**
 * Performs a simulation run of the guard's patrol using the given `SimpleGrid`, then returns an
 * object describing the results:
 *
 * - `loop: boolean`: Whether the guard entered a loop.
 * - `visited: number`: The number of cells the guard visited in the course of the simulation.
 * - `states: Set`: The set of states the guard was in during the simulation. Each state is a string
 *   in the format `<r>,<c>,<dir>`, where `r` and `c` are the row and column coordinates of the
 *   guard's position, and `dir` is a number from `0` to `3` representing the guard's direction (`0`
 *   = north, `1` = east, `2` = south, `3` = west).
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

  return { loop, visited: visited.size, states: seenStates };
};

/**
 * Given the lab grid and a `Set` of states the guard was in during the initial simulation run,
 * find all the candidate locations to put obstructions and test them one at a time, counting how
 * many cause the guard to go into a loop.
 *
 * @param {SimpleGrid} grid - the grid representing the lab
 * @param {Set<string>} states - the states as returned by `simulate()`
 * @returns {number} - the number of candidate obstructions that cause the guard to go into a loop
 */
const findLoops = (grid, states) => findCandidateObtructionLocations(grid, states)
  .filter(([ r, c ]) => testObstructionLocation(grid, r, c))
  .length;

/**
 * Determine the locations in the grid where an obstruction could be placed to cause the guard to
 * deviate from her initial patrol path.
 *
 * @param {SimpleGrid} grid - the grid representing the lab
 * @param {Set<string>} states - the states as returned by `simulate()`
 * @returns {Set<number[]>} - the candidate obstruction locations
 */
const findCandidateObtructionLocations = (grid, states) => {
  const candidateObstructions = new Set();
  states.forEach(state => {
    // Find the cell directly in front of the guard at this state.
    let [ r, c, dirIndex ] = state.split(',').map(Number);
    const dir = DIRECTIONS[dirIndex];
    r += dir.r;
    c += dir.c;

    // Is it in bounds and unoccupied?
    if (grid.inBounds(r, c) && grid.get(r, c) === '.') {
      // This is a valid candidate.
      candidateObstructions.add(`${r},${c}`);
    }
  });
  return [ ...candidateObstructions ].map(coords => coords.split(',').map(Number));
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
