const { match } = require('../util');

const CONNECTIONS_REGEXP = /^(?<from>\w+): (?<to>.+)$/gm;

/**
 * # [Advent of Code 2025 Day 11](https://adventofcode.com/2025/day/11)
 *
 * This is a graph traversal problem where we need to count the number of paths between the source
 * and target nodes in a directed acyclic graph. In part two, a different start node is used that
 * greatly increases the number of paths being considered, and a requirement that two specific nodes
 * must be included on the path is added.
 *
 * The changes in part two make a more naive search take far too long. Memoization can be used to
 * optimize the search so that we don't recompute paths from nodes we've already seen in other
 * search branches. However, storing full paths in the memoization cache would use too much memory.
 * However, we don't actually have to store the full paths, since we're only interested in _how
 * many_ paths fulfill the requirement. Our memoization cache need only track 1) what node we're on,
 * 2) which required nodes have been visited so far, and 3) how many paths have lead to that state.
 *
 * To store which required nodes have been visited, we can use a bit field, where each bit
 * represents whether or not we have visited the corresponding node. Since there are only two nodes
 * that are required, the possible values in the bit field are just 0 - 3. However, this could
 * theoretically track as many required nodes as desired.
 *
 * Using a depth-first search allows our memoization cache to start recording results sooner,
 * allowing us to start pruning search branches earlier.
 *
 * @param {string} input - the puzzle input
 * @returns {number[]} - the puzzle answers
 */
module.exports = (input, part) => {
  const graph = parse(input);
  const parts = [ part1, part2 ];

  if (part !== undefined) {
    return parts[part - 1](graph);
  }

  return parts.map(fn => fn(graph));
};

/**
 * Parses the input into an adjacency map of the graph.
 *
 * @param {string} input - the puzzle input
 * @returns {Map<string, string[]>} - the adjacency map of the graph
 */
const parse = input => {
  const graph = new Map();
  match(input, CONNECTIONS_REGEXP).forEach(({ from, to }) => {
    graph.set(from, to.split(' '));
  });
  return graph;
};

/**
 * Finds the number of paths in a directed acyclic graph from source to target, including all
 * required nodes on the path.
 *
 * @param {Map<string, string[]>} graph - the adjacency map of the graph
 * @param {string} source - the starting node ID
 * @param {string} target - the target node ID
 * @param {string[]} [requiredNodes=[]] - IDs of nodes that are required to be on the path
 * @returns {number}
 */
const findAllPaths = (graph, source, target, requiredNodes = []) => {
  const memo = new Map();
  const requiredIdBits = Object.fromEntries(requiredNodes.map((n, i) => [ n, i ]));
  const allVisitedBits = requiredNodes.length ? (1 << requiredNodes.length) - 1 : 0;

  /**
   * DFS helper function.
   *
   * @param {string} node - the node we're searching from
   * @param {number} visitedBits - a bit field representing which required nodes have been visited
   * @returns {number} - the number of valid paths from node to target
   */
  const dfs = (node, visitedBits) => {
    const key = `${node}|${visitedBits}`;

    if (memo.has(key)) {
      // We've already memoized this state; just return it.
      return memo.get(key);
    }

    if (node === target) {
      // We found the target node; return 1 for this path if all required nodes were visited.
      return visitedBits === allVisitedBits ? 1 : 0;
    }

    let nextBits = visitedBits;

    if (node in requiredIdBits) {
      // We've found a required node; update our bit field.
      nextBits |= (1 << requiredIdBits[node]);
    }

    let count = 0;
    const neighbors = graph.get(node) ?? [];

    for (const neighbor of neighbors) {
      // Recurse for each neighbor.
      count += dfs(neighbor, nextBits);
    }

    // Memoize this count and return it.
    memo.set(key, count);
    return count;
  };

  // Kick off the DFS from the source node with no required nodes visited.
  return dfs(source, 0);
};

/**
 * Finds the number of paths for part 1.
 *
 * @param {Map<string, string[]>} graph - the adjacency map of the graph
 * @returns {number} - the number of paths from 'you' to 'out'
 */
const part1 = graph => findAllPaths(graph, 'you', 'out');

/**
 * Finds the number of paths for part 2.
 *
 * @param {Map<string, string[]>} graph - the adjacency map of the graph
 * @returns {number} - the number of valid paths from 'svr' to 'out'
 */
const part2 = graph => findAllPaths(graph, 'svr', 'out', [ 'dac', 'fft' ]);
