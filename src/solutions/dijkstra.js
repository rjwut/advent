const PriorityQueue = require('./priority-queue');

const COST_COMPARATOR = (a, b) => a.cost - b.cost;
const INFINITE_COST_ENTRY = { cost: Infinity };

/**
 * A generic implementation of
 * [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm). This function has
 * been designed to be implementation agnostic: instead of expecting the graph to be provided in a
 * specific data structure, you simply provide an edge function which accepts a node from the graph
 * as its argument and returns an array of objects representing the edges leading from that node.
 * This makes is possible to use Dijkstra's algorithm graphs with any representation, graphs that
 * are too large to fit in memory, or even infinite graphs.
 *
 * The edge objects returned by the edge function should have the following properties:
 *
 * - `node: any`: The node to which this edge leads.
 * - `cost?: number`: The cost of traversing this edge. This must be a non-negative value, and will
 *   be assumed to be `1` if omitted.
 *
 * Nodes in the graph can be any type of value. If you use objects as nodes, they are compared by
 * reference: a different reference is considered a different node, even if its contents are
 * identical. If you want to allow separate objects to represent the same node, specify the `keyFn`
 * option with a function that accepts a node and returns a unique key for it. When this option is
 * not specified, the key for a node is essentially the node itself. Node keys can be any type
 * except `Function`, and object keys are compared by reference.
 *
 * Often your search will have one or more "goal" nodes. Specifying the `goal` option speeds up the
 * search by ending search branches that reach a goal node and pruning branches that have become
 * more costly than the best goal path found so far. If there is only one goal node, you can simply
 * specify its key (or the node itself, if the `keyFn` option is not used) as the `goal` option. If
 * there are potentially multiple goal nodes, you can instead specify a predicate function that
 * will receive the node and its key as arguments and returns a boolean indicating whether it is a
 * goal node. Note that specifying the `goal` option is required for searching infinite graphs to
 * avoid running forever.
 *
 * The returned `Map` will have a key for each node that was reached in the graph, where the keys
 * are those provided by the `keyFn` option (or the nodes themselves, in its absence). Stored under
 * each key is an object with the following properties:
 *
 * - `node: any`: A reference to the node.
 * - `cost: number`: The total cost of the best path to this node.
 * - `prev: any`: The key for the previous node in the best path to this node, or `null` if this is
 *   the start node.
 *
 * Nodes which are unreachable or which were not visited due to being pruned will not have entries
 * in the `Map`.
 *
 * To produce the full path to a given node, you can look up the node in the returned `Map`, then
 * repeatedly follow the `prev` keys until you arrive back at the start node (where `prev` will be
 * `null`).
 *
 * @param {*} startNode - the starting node from which to perform the search
 * @param {Function} edgeFn - a function which receives a node and returns an array of edge objects
 * adjacent to the node
 * @param {Object} options - search options
 * @param {Function} [options.keyFn] - a function which produces a unique key for each node; if
 * omitted, the nodes themselves are used as keys
 * @param {*} [options.goal] - an optional goal, either the key for a goal node, or a predicate
 * function that returns `true` if the given node represents a goal
 * @returns {Map<*, Object>} - the shortest path to each node from the starting node
 */
module.exports = (startNode, edgeFn, options) => {
  options = {
    keyFn: n => n,
    goal: undefined,
    ...options,
  };

  if (options.goal !== undefined && typeof options.goal !== 'function') {
    // A key was specified for the goal; convert it to a predicate function
    const goalKey = options.goal;
    options.goal = (_, key) => key === goalKey;
  }

  const best = new Map();
  const startEntry = { node: startNode, cost: 0, prev: null };
  best.set(options.keyFn(startNode), startEntry);
  const visited = new Set();
  const frontier = new PriorityQueue(COST_COMPARATOR);
  frontier.enqueue(startEntry);
  let bestGoal = INFINITE_COST_ENTRY;

  do {
    const { node, cost } = frontier.dequeue();
    const key = options.keyFn(node);
    visited.add(key);
    edgeFn(node).forEach(({ node: nextNode, cost: edgeCost = 1 }) => {
      const nextKey = options.keyFn(nextNode);

      if (visited.has(nextKey)) {
        return; // we've already visited this node; skip it
      }

      const nextCost = cost + edgeCost;
      const entry = { node: nextNode, cost: nextCost, prev: key };
      const nextBest = best.get(nextKey) ?? INFINITE_COST_ENTRY;

      if (nextBest.cost > nextCost) {
        // This is the best path to this node so far
        best.set(nextKey, entry);
        frontier.enqueue(entry);
      }

      if (options.goal?.(nextNode, nextKey)) {
        // We've encountered a goal node
        if (bestGoal.cost > nextCost) {
          // ...and it's the best goal path so far
          bestGoal = entry;
        }

        return; // don't keep searching past goal nodes
      }
    });
  } while (!frontier.empty);

  return best;
};
