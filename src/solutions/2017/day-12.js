const { split } = require('../util');

/**
 * # [Advent of Code 2017 Day 12](https://adventofcode.com/2017/day/12)
 *
 * The input describes a disconnected graph, and the puzzle requires us to
 * identify the members of each connected subgraph. The algorithm to group the
 * nodes into connected subgraphs is as follows:
 *
 * 1. Put all nodes into an `unvisited` set.
 * 2. Create an empty `groups` array.
 * 3. While `unvisited` is not empty:
 *    1. Take any node from `unvisited`, and insert it as the only node in a
 *       new stack.
 *    2. Create a new set called `group` to hold the members of the subgraph.
 *    3. While the stack is not empty:
 *       1. Pop a node from the stack.
 *       2. If the node is already in `group`, skip this node.
 *       3. Add the node to `group`.
 *       4. Delete the node from `unvisited`.
 *       5. Push each of the node's neighbors onto the stack.
 *    4. Add `group` to the `groups` array.
 *
 * When the algorithm finishes, `groups` is an array of sets, each of which
 * contains all nodes in one connected subgraph.
 *
 * The answer to part two is just the length of `groups`. For part one's
 * answer, we just have to `find()` the group that contains `0` and return its
 * size.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const groups = parse(input);
  return [
    groups.find(group => group.has(0)).size,
    groups.length,
  ];
};

/**
 * Parses the puzzle input, produces the graph that it represents, and then
 * finds all connected subtgraphs. Each subgraph is a `Set` containing the IDs
 * of all nodes in the subgraph.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the connected subgraphs
 */
const parse = input => {
  const map = split(input).reduce((map, line) => {
    const parts = line.split(' <-> ');
    map.set(Number(parts[0]), parts[1].split(', ').map(Number));
    return map;
  }, new Map());
  const unvisited = new Set([ ...map.keys() ]);
  const groups = [];

  do {
    const [ startingId ] = unvisited;
    unvisited.delete(startingId);
    const stack = [ startingId ];
    const group = new Set();

    do {
      const id = stack.pop();

      if (group.has(id)) {
        continue;
      }

      group.add(id);
      unvisited.delete(id);
      map.get(id).forEach(childId => stack.push(childId));
    } while (stack.length);

    groups.push(group);
  } while (unvisited.size);

  return groups;
};
