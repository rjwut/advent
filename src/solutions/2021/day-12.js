const { split } = require('../util');

/**
 * # [Advent of Code 2021 Day 12](https://adventofcode.com/2021/day/12)
 *
 * One optimization that can be done is to recognize that all the paths that
 * are valid for part one are also valid for part two. So we can just walk the
 * cave system once and keep separate counters for the number of valid paths
 * for both parts: one for paths that never revisit a small cave (part one),
 * and one that counts the number of paths found regardless of whether a small
 * cave is revisited or not (part two).
 *
 * Note that we'll blow the stack if we try to use recursion, so instead we use
 * our own stack to keep track of all the paths we're currently exploring. The
 * algorithm for solving both parts of the puzzle at once is as follows:
 *
 * 1. Create a `Map` in which to store caves.
 * 2. Parse the input. For each line, ensure that a `Map` entry exists for both
 *    of the mentioned caves, and create one if a cave doesn't exist. Each cave
 *    object has two properties: `id` (string) and `neighbors` (array of
 *    strings). Placing the ID of each cave in the other's `neighbors` array
 *    creates a bi-directional tunnel between them. Since `start` is not
 *    not allowed to be revisited, tunnels leaving `start` are _not_
 *    bi-directional.
 * 3. Create the path counters for both parts and set them to `0`.
 * 4. Create a stack to keep entries containing the data for each path
 *    currently being processed. Each path entry is an object with two
 *    properties:
 *    - `path`: an array containing the caves in the order they are visited
 *    - `canRevisit`: a boolean indicating whether the we are still allowed to
 *      revisit a small cave on this path
 *    Technically, you can tell if a revisit is still allowed by seeing if any
 *    small cave is listed in `path` twice, but this is expensive to recompute
 *    all the time, so I just track it separately.
 * 5. Populate the stack with a single entry: a path containing only the
 *    `start` cave and with `canRevisit` set to `true`.
 * 6. While the stack is not empty:
 *    1. Remove the next entry from the stack.
 *    2. Get the cave object for the last cave in the path.
 *    3. Filter the list of the cave's neighbors so that only those caves which
 *       are eligible to be visited (using part two's rules) are included.
 *    4. Iterate the filtered list:
 *       - If the neighbor is `end`, increment the path counter for part two.
 *         If in addition `canRevisit` is `true` for the current entry,
 *         increment the path counter for part one as well.
 *       - If the neighbor is not `end`, add a new entry to the stack, where
 *         `path` is the current path with the neighbor added to the end. The
 *         `canRevisit` property on the new entry is `true` only if the current
 *         entry's `canRevisit` is `true` and the neighbor is not a small cave
 *         that is already in the path. Otherwise, it's `false`.
 *
 * Once the stack is empty, all paths have been processed, and the two counters
 * contain the puzzle answers.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const caves = parse(input);
  return walk(caves);
};

/**
 * Parses the input. Each cave object has two properties: `id` (string) and
 * `neighbors` (array of neighboring cave IDs).
 *
 * @param {string} input - the puzzle input
 * @returns {Map} - the cave objects, mapped by their IDs
 */
const parse = input => {
  const lines = split(input).map(line => line.split('-'));
  const caves = new Map();

  /**
   * Returns the cave object with the given ID from the `caves` `Map`. If the
   * cave does not exist, it is created first and added to the `Map`.
   *
   * @param {string} id - the cave to retrieve
   * @returns {Object} - the cave object
   */
  const getCave = id => {
    let cave = caves.get(id);

    if (!cave) {
      cave = {
        id,
        neighbors: [],
      };
      caves.set(id, cave);
    }

    return cave;
  };

  // Create tunnels between the caves. Note that tunnels connected to start are
  // NOT bi-directional, so that you can't get back to it once you leave it.
  lines.forEach(line => {
    const relCaves = line.map(getCave);

    if (line[1] !== 'start') {
      relCaves[0].neighbors.push(line[1]);
    }

    if (line[0] !== 'start') {
      relCaves[1].neighbors.push(line[0]);
    }
  });

  return caves;
};

/**
 * Walks the cave graph to find all possible paths from `start` to `end`. Note
 * that since all paths that are valid for part one are also valid for part
 * two, we traverse the graph using part two's rules, and keep two counters:
 * the part two counter is incremented for all paths we find, while the part
 * one counter is only incremented for those paths that don't revisit a small
 * cave. Then both counters are returned in an array.
 *
 * @param {Map} caves - the cave `Map`
 * @returns {Array} - the puzzle answers
 */
const walk = caves => {
  let partOneCount = 0;
  let partTwoCount = 0;
  const stack = [
    {
      path: [ 'start' ],
      canRevisit: true,
    },
  ];

  while (stack.length) {
    const entry = stack.pop();
    const cave = caves.get(entry.path[entry.path.length - 1]);
    cave.neighbors
      .filter(id => {
        if (!isSmall(id) || entry.canRevisit) {
          return true;
        }

        return !entry.path.includes(id);
      })
      .forEach(id => {
        if (id === 'end') {
          partTwoCount++;

          if (entry.canRevisit) {
            partOneCount++;
          }

          return;
        }

        const newEntry = {
          path: [ ...entry.path, id ],
          canRevisit: entry.canRevisit,
        };
  
        if (isSmall(id)) {
          if (entry.path.includes(id)) {
            newEntry.canRevisit = false;
          }
        }
  
        stack.push(newEntry);
      });
  }

  return [ partOneCount, partTwoCount ];
};

/**
 * Returns whether the named cave is small.
 *
 * @param {string} id - the cave ID
 * @returns {boolean} - `true` if it's small, `false` otherwise
 */
const isSmall = id => id === id.toLowerCase();
