const PriorityQueue = require('./priority-queue');

/**
 * Generic implementation of the A* pathfinding algorithm.
 *
 * The data associated with each node is as follows:
 *
 * - `prev` (any): The data entry associated with the node that lead to this
 *   node.
 * - `f` (number): How fruitful it is believed to be to move to this node. This
 *   the sum of `g` and `h`.
 * - `g` (number): The cost of the best known path to this node.
 * - `h` (number): The heuristic cost of moving to this node; does it get us
 *   closer to the goal or further away?
 *
 * @param {*} startNode - The starting node from which to perform the search.
 * @param {*} goal - A reference to the goal node, or a `Function` to be used
 * as a predicate to test whether the node passed into it is a goal node. The
 * latter can enable more complex functionality such as real-time goal testing
 * or allowing multiple possible goals.
 * @param {Function} getEdges - A function which returns an array of edge
 * objects leading to the neighbors of a given node. Each edge object must have
 * a `node` property which is a reference to the neighboring node. It may also
 * have a `cost` property, which is a numeric value representing the cost of
 * moving to this node. If `cost` is omitted, `1` is assumed.
 * @param {Function} heuristic - A function which returns the heuristic cost of
 * moving to a given node. Nodes which appear closer to the goal should have
 * lower heuristic costs than nodes which appear further away.
 * @returns {Object|null} An object describing the path to the goal node, or
 * `null` if no path was found. The object will have a `path` property, which
 * is an array of nodes starting at `startNode` and ending at the goal node,
 * and a `cost` property, which is the total cost of the path.
 */
module.exports = (startNode, goal, getEdges, heuristic) => {
  const goalPredicate = typeof goal === 'function' ? goal : node => node === goal;
  const frontier = new PriorityQueue((a, b) => a.f - b.f);
  const nodeData = new Map();
  const startNodeEntry = {
    node: startNode,
    prev: null,
    g: 0,
    h: heuristic(startNode),
  };
  startNodeEntry.f = startNodeEntry.h;
  nodeData.set(startNode, startNodeEntry);
  frontier.enqueue(startNodeEntry);
  const visited = new Set();
  let goalEntry = null;

  do {
    const entry = frontier.dequeue();

    if (goalPredicate(entry.node)) {
      goalEntry = entry;
      break;
    }

    getEdges(entry.node).forEach(({ node: neighbor, cost = 1 }) => {
      if (visited.has(neighbor)) {
        return;
      }

      const g = entry.g + cost;
      let neighborEntry = frontier.find(entry => entry.node === neighbor);

      if (neighborEntry) {
        if (neighborEntry.g > g) {
          neighborEntry.g = g;
          neighborEntry.f = g + neighborEntry.h;
          neighborEntry.prev = entry;
          frontier.remove(neighborEntry);
          frontier.enqueue(neighborEntry);
        }
      } else {
        const neighborEntry = {
          node: neighbor,
          prev: entry,
          g,
          h: heuristic(neighbor),
        };
        neighborEntry.f = neighborEntry.g + neighborEntry.h;
        nodeData.set(neighbor, neighborEntry);
        frontier.enqueue(neighborEntry);
      }
    });

    visited.add(entry.node);
  } while (!frontier.empty);

  if (goalEntry) {
    const path = [];
    let entry = goalEntry;

    while (entry) {
      path.push(entry.node);
      entry = entry.prev;
    }

    path.reverse();
    return {
      path,
      cost: goalEntry.g,
    };
  }

  return null;
};
