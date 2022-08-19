const { match } = require('../util');

const REGEXP = /^(?<start>.+) to (?<end>.+) = (?<distance>\d+)$/gm;
const SHORTEST_PATH_FN = (p1, p2) => p1.distance - p2.distance;
const LONGEST_PATH_FN = (p1, p2) => p2.distance - p1.distance;

/**
 * # [Advent of Code 2015 Day 9](https://adventofcode.com/2015/day/9)
 *
 * The only difference between the two parts is whether we want the shortest
 * path or the longest one, so the comparator function used in the sort will be
 * what is passed in for each part.
 *
 * We parse the input into a `Map` of `Map`s, where the keys in the maps are
 * the names of destinations. To find the distance between two locations, look
 * up the first location in the parent `Map`, which returns a second `Map`.
 * Look up the second location in that `Map` to get the distance.
 *
 * The pathfinding problem is solved with recursion. With each call to
 * `findBestPath()`, we pass in the current state of this search branch,
 * including the list of visited locations, the list of unvisited locations,
 * and the distance travelled. Each time, we iterate the unvisited locations
 * and try adding them one by one to the end of the path. If adding a location
 * to the path results in no more unvisited locations, we simply return that
 * path. Otherwise, we recurse with each new path, sort the results by
 * distance, and return the shortest/longest one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = parse(input);
  return [ SHORTEST_PATH_FN, LONGEST_PATH_FN ]
    .map(fn => findBestPath(graph, fn).distance);
};

/**
 * Produces a dictionary for looking up distances between locations.
 *
 * @param {string} input - the puzzle input
 * @returns {Map<Map<number>>} - the dictionary
 */
const parse = input => {
  const edges = match(input, REGEXP, { distance: Number });
  const map = new Map();

  const getNode = name => {
    let node = map.get(name);

    if (!node) {
      node = new Map();
      map.set(name, node);
    }

    return node;
  };

  edges.forEach(edge => {
    let node0 = getNode(edge.start);
    let node1 = getNode(edge.end);
    node0.set(edge.end, edge.distance);
    node1.set(edge.start, edge.distance);
  });
  return map;
};

/**
 * Returns the best path. Paths are objects representing search state with the
 * following properties:
 *
 * - `nodes` (`Array<string>`): The names of the locations visited on this
 *   search branch, in the order they were visited
 * - `unvisited` (`Array<string>`): The names of the unvisited locations
 * - `distance` (`number`): The distance travelled so far
 *
 * @param {Map<Map<number>>} graph - stores the locations and distances
 * @param {Function} pathSortFn - the comparator function that determines which
 * path is better
 * @param {Object} [state] - the current search state
 * @returns {Object} - the best path
 */
const findBestPath = (graph, pathSortFn, state) => {
  let current;

  if (!state) {
    state = {
      nodes: [],
      unvisited: [ ...graph.keys() ],
      distance: 0,
    };
  } else {
    current = state.nodes[state.nodes.length - 1];
  }

  const paths = state.unvisited.map((next, i) => {
    const nodes = [ ...state.nodes, next ];
    const distance = state.distance + (current ? graph.get(current).get(next) : 0);
    const unvisited = [ ...state.unvisited ];
    unvisited.splice(i, 1)
    return { nodes, unvisited, distance };
  });

  if (paths.length === 1) {
    return paths[0];
  }

  const finalPaths = paths.map(path => findBestPath(graph, pathSortFn, path));
  finalPaths.sort(pathSortFn);
  return finalPaths[0];
};
