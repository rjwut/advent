const InfiniteGrid = require('../infinite-grid');

const Directions = {
  N: [ -1,  0 ],
  S: [  1,  0 ],
  E: [  0,  1 ],
  W: [  0, -1 ],
};

/**
 * # [Advent of Code 2018 Day 20](https://adventofcode.com/2018/day/20)
 *
 * The input is described as a regular expression, but using it as one is an
 * exercise in futility. Are you going to generate all the possible strings of
 * directions and see which ones match? No way.
 *
 * Instead, we can build a graph describing the facility by traversing the
 * input character by character. We will also need a way to jump back to an
 * intersection when we want to go down another path, and a way to lay out the
 * graph nodes in a grid so that we can tell if a path leads us to a room we've
 * encountered before. The `buildGraph()` documentation describes how this is
 * done.
 *
 * Once the graph is built, we can traverse it to find the shortest path to
 * each node from the start node. See the documentation for `traverse()` for
 * details. Note that we can't do this while we are building the graph, because
 * there is no guarantee that we are following shortest paths.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = buildGraph(input);
  const result = traverse(graph);
  return [ result.maxDistance, result.atLeast1000 ];
};

/**
 * Iterates the input string and builds a graph of the facility.
 *
 * We start with a node representing the starting position. Each node is an
 * object with the following properties:
 *
 * - `coords` (array): The room coordinates.
 * - `edges` (Object): A map of the directions that lead to other rooms. The
 *   keys are direction letters, and the values are the adjacent nodes.
 * - `distance` (number): The distance from the starting room.
 * - `visited` (boolean): Whether or not we've visited this room when seeking
 *   the shortest paths.
 *
 * The latter two properties will be used when we traverse the graph later. For
 * now, we'll set `distance` to `Infinity` and `visited` to `false` for each
 * node as we create them. The start node, however, will have `distance` set to
 * `0`.
 *
 * Each time we encounter `N`, `S`, `E`, or `W` in the input string, we create
 * edges from the current node to an adjacent node and back. Note that the
 * adjacent node may already exist, so we need to be able to look up nodes by
 * their coordinates. We can use the existing `InfiniteGrid` class for this.
 * If it doesn't exist, we create the node and add it to the grid.
 *
 * When we encounter a `(`, we are at an intersection, and need to be able to
 * jump back to it when we encounter `|` to go down another path, and again
 * when we encounter `)` to finish the intersection. Upon encountering `(`, we
 * push the current node onto a stack. We set the current node back to the top
 * node on the stack whenever we encounter `|` or `)`, and in the latter case,
 * we also pop that node off the stack.
 *
 * When we finish iterating the string, our graph is complete, and we return a
 * reference to the starting node.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the starting node in the graph
 */
const buildGraph = input => {
  input = input.trim();
  input = input.substring(1, input.length - 1);
  const start = { coords: [ 0, 0 ], edges: {}, distance: 0, visited: false };
  const grid = new InfiniteGrid();
  grid.put(start.coords, start);
  const stack = [];
  let current = start;

  for (let i = 0; i < input.length; i++) {
    const chr = input.charAt(i);

    if (chr === '(') {
      stack.push(current);
    } else if (chr === ')') {
      current = stack.pop();
    } else if (chr === '|') {
      current = stack[stack.length - 1];
    } else {
      const direction = Directions[chr];
      let adjacentCoords = current.coords.map((coord, i) => coord + direction[i]);
      let adjacent = grid.get(adjacentCoords);

      if (!adjacent) {
        adjacent = {
          coords: adjacentCoords,
          edges: {},
          distance: Infinity,
          visited: false,
        };
        grid.put(adjacentCoords, adjacent);
      }

      current.edges[chr] = adjacent;
      adjacent.edges[opposite(chr)] = current;
      current = adjacent;
    }
  }

  return start;
}

/**
 * Computes the shortest paths from each node in the graph from the starting
 * node, then returns an object that gives the distance to the most distant
 * node and the number of nodes whose distance is at least `1000`. The
 * algorithm is as follows:
 *
 * 1. Create a queue containing the starting node.
 * 2. Create a result object with two properties: `maxDistance` and
 *    `atLeast1000` (number). We'll return this object at the end.
 * 3. While the queue is not empty:
 *    1. Take the first node from the queue.
 *    2. Skip it if it has already been visited.
 *    3. Mark it as visited.
 *    4. If the node's `distance` is greater than `maxDistance`, update
 *       `maxDistance` to match.
 *    5. If the node's `distance` is at least `1000`, increment `atLeast1000`.
 *    6. Iterate the node's `edges`:
 *       1. If the adjacent node is visited, skip it.
 *       2. Set the adjacent node's `distance` to this node's `distance` plus
 *          `1`.
 *       3. Add the adjacent node to the queue.
 * 4. Return the result object.
 *
 * @param {Object} start - the starting node in the graph
 * @returns {Object} - the result object
 */
const traverse = start => {
  const queue = [ start ];
  const result = {
    maxDistance: 0,
    atLeast1000: 0,
  };

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.visited) {
      continue;
    }

    current.visited = true;
    result.maxDistance = Math.max(result.maxDistance, current.distance);

    if (current.distance >= 1000) {
      result.atLeast1000++;
    }

    for (const direction in current.edges) {
      const next = current.edges[direction];

      if (next.visited) {
        continue;
      }

      next.distance = current.distance + 1;
      queue.push(next);
    }
  }

  return result;
};

/**
 * Returns the direction that is opposite of the given direction.
 *
 * @param {string} direction - one of `N`, `S`, `E`, or `W`
 * @returns {string} - the opposite direction
 */
const opposite = direction => {
  switch (direction) {
    case 'N': return 'S';
    case 'S': return 'N';
    case 'E': return 'W';
    case 'W': return 'E';
  }
};
