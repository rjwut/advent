const { split } = require('../util');
/**
 * # [Advent of Code 2025 Day 8](https://adventofcode.com/2025/day/8)
 *
 * The difference between the two parts is:
 *
 * - Part 1: Stop at 1000 connections, then return the product of the sizes of the three largest
 *   circuits.
 * - Part 2: Stop when all junctions are connected in a single circuit, then return the product of
 *   the X-coordinates of the last two junctions connected.
 *
 * We can do both parts in a single pass by keeping track of the number of connections made,
 * computing the answer for part 1 when we reach the required number of connections, and exiting the
 * loop once all junctions are connected to the same circuit.
 *
 * 1. Parse input into an array of `Junction` objects, which store their coordinates and connected
 *    `Junctions`, and can compute distance to another junction. (Since it won't make any difference
 *    in the results, we can compute `x^2 + y^2 + z^2` and skip the square root to save time.)
 * 2. Compute distances between every pair of junctions, store the results in an array, and sort it.
 * 3. Begin loop:
 *    1. Pop the shortest distance from the array.
 *    2. Connect those two junctions.
 *    3. If we have now connected 1000 junctions, compute the part 1 answer by finding all
 *       subgraphs, sorting them by size, taking the three largest, and multiplying their sizes
 *       together.
 *    4. If there is now only one subgraph, compute the part 2 answer by multiplying the
 *       X-coordinates of the last two junctions connected. Return both answers.
 *
 * To find the subgraphs:
 *
 * 1. Iterate junctions:
 *    1. Skip if we've already visited this junction.
 *    2. Create a stack with this junction as the only entry.
 *    3. While the stack is not empty:
 *       1. Pop a junction from the stack.
 *       2. Skip if we've already visited this junction.
 *       3. Mark this junction as visited, and add it to the current subgraph.
 *       4. Push all adjacent junctions onto the stack.
 *    4. Add the completed subgraph to the list of subgraphs.
 * 2. Return the list of subgraphs.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part1ConnectionCount = 1000) => {
  const junctions = split(input).map(line => new Junction(line));

  // Compute all junction distances and sort them
  const distances = [];
  const limit = junctions.length - 1;

  for (let i = 0; i < limit; i++) {
    for (let j = i + 1; j <= limit; j++) {
      const junction0 = junctions[i];
      const junction1 = junctions[j];
      const distance = junction0.distanceTo(junction1);
      distances.push({ distance, junction0, junction1 });
    }
  }

  distances.sort((a, b) => b.distance - a.distance)
  let connectionCount = 0;
  let part1;

  do {
    // Connect the closest two unconnected junctions
    const { junction0, junction1 } = distances.pop();
    Junction.connect(junction0, junction1);
    connectionCount++;

    // Compute subgraphs
    const subgraphs = findSubgraphs(junctions);

    if (connectionCount === part1ConnectionCount) {
      // We've made enough connections for part 1; compute the answer
      part1 = subgraphs
        .sort((a, b) => b.length - a.length)
        .slice(0, 3)
        .reduce(
          (product, subgraph) => product * subgraph.length, 1
        );
    } else if (subgraphs.length === 1) {
      // All junctions are now connected; compute part 2 answer and return both
      return [ part1, junction0.coords[0] * junction1.coords[0] ];
    }
  } while (true);
};

/**
 * Finds all sets of connected junctions.
 *
 * @param {Junction[]} junctions - the junctions to search
 * @returns [Junction[][]] - the found subgraphs
 */
const findSubgraphs = junctions => {
  const subgraphs = [];
  const visited = new Set();

  for (const junction of junctions) {
    if (visited.has(junction)) {
      continue;
    }

    // Start a new subgraph
    const subgraph = [];
    const toVisit = [ junction ];

    while (toVisit.length) {
      // Explore adjacent junctions to find all members of the subgraph
      const current = toVisit.pop();

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);
      subgraph.push(current);

      for (const adjacent of current.adjacent) {
        toVisit.push(adjacent);
      }
    }

    subgraphs.push(subgraph);
  }

  return subgraphs;
};

/**
 * Represents a junction in 3D space, and its connections to adjacent junctions.
 */
class Junction {
  /**
   * Connects the two given `Junction`s.
   *
   * @param {Junction} junction0 - the first junction
   * @param {Junction} junction1 - the second junction
   */
  static connect(junction0, junction1) {
    junction0.addAdjacent(junction1);
    junction1.addAdjacent(junction0);
  }

  coords;
  adjacent;

  /**
   * Constructs a `Junction` from a line of input.
   *
   * @param {string} line - the input line describing the `Junction` to construct
   */
  constructor(line) {
    this.coords = line.split(',').map(Number);
    this.adjacent = [];
  }

  /**
   * Makes the given `Junction` adjacent to this one.
   * @param {Junction} junction - the junction to make adjacent
   */
  addAdjacent(junction) {
    this.adjacent.push(junction);
  }

  /**
   * Computes the distance to another `Junction`. Note that this actually returns the square of the
   * distance, to avoid the cost of a square root operation, since we're only interested in sorting
   * `Junction`s by distance, not the actual distances themselves.
   *
   * @param {Junction} that - the other junction
   * @returns {number} - the squared distance to the other junction
   */
  distanceTo(that) {
    return this.coords.reduce(
      (sum, coord, index) => sum + (coord - that.coords[index]) ** 2, 0
    );
  }
}
