const gridToGraph = require('../grid-to-graph');
const { parseGrid } = require('../util');

const START_REPLACEMENT = [
  [ '0', '#', '1' ],
  [ '#', '#', '#' ],
  [ '2', '#', '3' ],
];

/**
 * # [Advent of Code 2019 Day 18](https://adventofcode.com/2019/day/18)
 *
 * Some observations:
 *
 * - The input maze can be represented as a graph, with nodes representing the
 *   locations of keys, doors, and the start. The edges represent the shortest
 *   path between two nodes.
 * - A key is considered "reachable" if we can get to it from our current
 *   location without being blocked by a door for which we don't currently have
 *   a key.
 * - There is no reason to move into a node for a door for which we don't have
 *   the key.
 * - Any move along an edge that isn't part of the shortest path to a key we
 *   don't yet have will never be part of the optimal solution.
 * - There is no reason to continue pursuing a search branch whose distance is
 *   longer than that of a previously found path to its current state, or
 *   longer than the best distance so far to the goal.
 *
 * For both parts of the puzzle, I use my `grid-to-graph` module to convert
 * the maze into a graph, with the start location, the keys, and the doors as
 * nodes. I then use that graph to compute the shortest paths from every
 * non-door node to every key node, noting their lengths and the keys required
 * to traverse them.
 *
 * The search is run using a stack of graph states, where each state consists
 * of the current node (or nodes, for part two) and the keys we still need. We
 * also track the distance we've travelled to reach that state. Each iteration,
 * we pop a state and its distance from the stack and compute what the next
 * states and distances would be if we were to move to each of the reachable
 * keys that we don't already have.
 *
 * Each time we arrive at a new state, we store the distance in a `Map`. There
 * will be multiple paths to arrive at the same state; if we find that the
 * stored distance for our state is less than or equal to the current distance,
 * we can abandon that search branch. Any state in which we've got all the keys
 * is an end state, and we track the best distance for that, too. Any path that
 * has already grown longer than the best known distance so far is also
 * abandoned. This prevents us from exploring paths that can't improve on what
 * we've already discovered.
 *
 * Part two has us modifying the maze to have four start locations in four
 * sections of the maze. Each section is isolated from the others. For this
 * part, I chose to use the digits `0` through `3` to represent the four start
 * locations. After overwriting the start location with the new data, I parse
 * the maze as before. The only other difference after that is that the state
 * now tracks four locations instead of just one, and we check available paths
 * for all four of them when pushing new states onto the stack.
 *
 * One potential improvement would be to use a priority queue so that paths
 * which are closest to collecting all the keys are explored first. The faster
 * we can reduce the best distance found so far, the fewer paths we have to
 * search.
 *
 * @param {string} input - the puzzle input
 * @param {number} part - the part of the puzzle to solve
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const parts = [ part1, part2 ];

  if (part !== undefined) {
    return parts[part - 1](input);
  }

  return parts.map(part => part(input));
};

/**
 * Computes the quickest path to collect all the keys in the original vault
 * layout.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the length of the shortest path
 */
const part1 = input => {
  const vault = buildVault(input);
  const allKeys = [ ...vault.keys() ].filter(isKey).sort().join('');
  const stack = [ {
    node: vault.get('@'),
    distance: 0,
    keysLeft: allKeys,
  } ];
  const distances = new Map();
  let bestDistance = Infinity;

  do {
    const entry = stack.pop();

    if (entry.distance > bestDistance) {
      continue; // Path is already longer than our best distance so far
    }

    const distanceKey = `${entry.node.id}/${entry.keysLeft}`;
    const distance = distances.get(distanceKey) ?? Infinity;

    if (distance <= entry.distance) {
      continue; // We've already found a shorter path to this state
    }

    distances.set(distanceKey, entry.distance);
    // Consider each reachable key we don't already have
    const paths = entry.node.paths.filter(path => {
      return shouldTraverse(path, entry.keysLeft);
    });
    paths.forEach(path => {
      const keyIndex = entry.keysLeft.indexOf(path.node.id);
      const newKeysLeft = entry.keysLeft.substring(0, keyIndex) +
        entry.keysLeft.substring(keyIndex + 1);
      const newDistance = entry.distance + path.distance;

      if (!newKeysLeft.length && newDistance < bestDistance) {
        bestDistance = newDistance; // New best distance!
        return;
      }

      stack.push({
        node: path.node,
        distance: newDistance,
        keysLeft: newKeysLeft,
      });
    });
  } while (stack.length);

  return bestDistance;
};

/**
 * Computes the quickest path to collect all the keys in the modified vault
 * layout.
 *
 * @param {string} input - the original puzzle input
 * @returns {number} - the length of the shortest path
 */
 const part2 = input => {
  const grid = parseGrid(input);
  overwriteStart(grid);
  const vault = buildVault(grid);
  const starts = [ '0', '1', '2', '3' ].map(id => vault.get(id));
  const allKeys = [ ...vault.keys() ].filter(isKey).sort().join('');
  const queue = [ {
    nodes: starts,
    distance: 0,
    keysLeft: allKeys
  } ];
  const distances = new Map();
  let bestDistance = Infinity;

  do {
    const entry = queue.pop();

    if (entry.distance > bestDistance) {
      continue; // Path is already longer than our best distance so far
    }

    const distanceKey = `${entry.nodes.map(node => node.id).join('')}/${entry.keysLeft}`;
    const distance = distances.get(distanceKey) ?? Infinity;

    if (distance <= entry.distance) {
      continue; // We've already found a shorter path to this state
    }

    distances.set(distanceKey, entry.distance);
    // Consider each reachable key we don't already have
    entry.nodes.forEach((node, nodeIndex) => {
      const paths = vault.get(node.id).paths.filter(path => {
        return shouldTraverse(path, entry.keysLeft);
      });
      paths.forEach(path => {
        const keyIndex = entry.keysLeft.indexOf(path.node.id);
        const newKeysLeft = entry.keysLeft.substring(0, keyIndex) +
          entry.keysLeft.substring(keyIndex + 1);
        const newDistance = entry.distance + path.distance;

        if (!newKeysLeft.length && newDistance < bestDistance) {
          bestDistance = newDistance; // New best distance!
          return;
        }

        const newNodes = [ ...entry.nodes ];
        newNodes[nodeIndex] = path.node;
        queue.push({
          nodes: newNodes,
          distance: newDistance,
          keysLeft: newKeysLeft,
        });
      });
    });
  } while (queue.length);

  return bestDistance;
};

/**
 * Searches the grid for the start location. This is used in part two so that
 * we can overwrite the area around it.
 *
 * @param {Array} grid - the grid
 * @returns {Array} - the coordinates of the start location
 */
const findStart = grid => {
  for (let r = 0; r < grid.length; r++) {
    const c = grid[r].indexOf('@');

    if (c !== -1) {
      return [ r, c ];
    }
  }
};

/**
 * Overwrites the start area with the modified vault layout.
 *
 * @param {Array} grid - the grid
 */
const overwriteStart = grid => {
  const start = findStart(grid);
  const r0 = start[0] - 1;
  const r1 = r0 + 3;
  const c0 = start[1] - 1;

  for (let r = r0; r < r1; r++) {
    const row = grid[r];
    row.splice(c0, 3, ...START_REPLACEMENT[r - r0]);
  }
};

/**
 * Constructs the vault data structure. This function receives either the
 * original string input, or a two-dimensional Array of characters representing
 * the vault layout. It returns a `Map`, where each key is the ID of either a
 * starting node or a key node. The value is a node object, which has the
 * following properties:
 *
 * - `id`: The ID of this node
 * - `coords`: The coordinates of this node in the grid, used for debugging
 *   purposes
 * - `edges`: An array containing objects representing the edges to other nodes
 *   in the graph:
 *   - `node`: The node to which this edge leads
 *   - `distance`: The distance for this edge
 * - `paths`: An array containing objects representing the paths each key node
 *   that is reachable from this node:
 *   - `node`: The node to which the path leads
 *   - `distance`: The total distance of the path
 *   - `requiredKeys`: An array of the keys required to traverse the path
 * @param {string|Array} input - the vault layout
 * @returns {Map} - the vault data structure
 */
const buildVault = input => {
  const graph = gridToGraph(input);

  for (let node of graph.values()) {
    if (!isDoor(node.id)) {
      node.paths = findKeyPaths(node);
    }
  }

  return new Map([ ...graph.entries() ]
    .filter(([ id ]) => !isDoor(id)));
};

/**
 * Find the shortest path to every reachable key node from the given start
 * node. Each object in the returned array represents a path to one reachable
 * key node and has the following properties:
 *
 * - `node`: The node to which the path leads
 * - `distance`: The total distance of the path
 * - `requiredKeys`: An array of the keys required to traverse the path
 *
 * @param {Object} start - the start node
 * @returns {Array} - the paths to each node
 */
const findKeyPaths = start => {
  const paths = new Map();
  const queue = [ {
    node: start,
    distance: 0,
    requiredKeys: isDoor(start.id) ? [ start.id.toLowerCase() ] : [],
  } ];

  do {
    const entry = queue.pop();
    const path = paths.get(entry.node.id) ?? { distance: Infinity };

    if (entry.distance < path.distance) {
      paths.set(entry.node.id, entry);
      entry.node.edges.forEach(edge => {
        let newKeys = entry.requiredKeys;

        if (isDoor(edge.node.id)) {
          newKeys = [ ...newKeys, edge.node.id.toLowerCase() ];
        }

        queue.push({
          node: edge.node,
          distance: entry.distance + edge.distance,
          requiredKeys: newKeys,
        });
      });
    }
  } while (queue.length);

  return [ ...paths.values() ].filter(path => {
    return isKey(path.node.id) && path.node !== start;
  });
};

/**
 * Returns whether we should traverse this path in our search. A path should be
 * traversed if we have all the required keys for it, and the destination has a
 * key that we still need.
 *
 * @param {Object} path - the path to check
 * @param {string} keysLeft - the keys we haven't collected yet
 * @returns {boolean} - `true` if this path should be traversed; `false`
 * otherwise
 */
 const shouldTraverse = (path, keysLeft) => {
  return path.requiredKeys.every(key => keysLeft.indexOf(key) === -1) &&
    keysLeft.indexOf(path.node.id) !== -1;
};

/**
 * Returns whether this ID represents a key.
 *
 * @param {string} id - the node ID
 * @returns {boolean} - `true` for a key, `false` otherwise
 */
const isKey = id => id >= 'a' && id <= 'z';

/**
 * Returns whether this ID represents a door.
 *
 * @param {string} id - the node ID
 * @returns {boolean} - `true` for a door, `false` otherwise
 */
 const isDoor = id => id >= 'A' && id <= 'Z';
