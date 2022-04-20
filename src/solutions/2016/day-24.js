const gridToGraph = require('../grid-to-graph');

/**
 * # [Advent of Code 2016 Day 24](https://adventofcode.com/2016/day/24)
 *
 * The input can be parsed and converted to a graph using my `grid-to-graph`
 * module. Once we've built a graph, we precompute the distances between any
 * two nodes in the graph, so that we can quickly look them up as we move from
 * node to node.
 *
 * Next, starting with the `'0'` node, we perform a breadth-first search where
 * we continually travel to unvisited nodes until they are all visited, using
 * our precomputed distance table to compute the total distance of each path.
 * Note that this will often pass nodes without marking them as visited, but
 * those paths will also be tried by the algorithm, and it runs quickly, so we
 * don't need to make any special effort to exclude them. We keep track of the
 * best length we find, both for part one (length of path to visit all nodes)
 * and part two (length of the path that visits all nodes and returns to the
 * start).
 *
 * An additional optimization prunes a search branch if it's already longer
 * than the best distance found so far.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = gridToGraph(input);
  const lookupTable = buildDistanceLookupTable(graph);
  const start = graph.get('0');
  const queue = [ {
    node: start,
    unvisited: [ ...graph.values() ].filter(node => node !== start),
    distance: 0,
  } ];
  const best = [ Infinity, Infinity ];

  do {
    const { node, unvisited, distance } = queue.shift();
    unvisited.forEach(nextNode => {
      const next = {
        node: nextNode,
        unvisited: unvisited.filter(node2 => node2 !== nextNode),
        distance: distance + lookupTable(node.id, nextNode.id),
      };

      if (best[1] > next.distance) {
        if (next.unvisited.length) {
          queue.push(next);
        } else {
          best[0] = Math.min(best[0], next.distance);
          const totalDistance = next.distance + lookupTable(next.node.id, '0');
          best[1] = Math.min(best[1], totalDistance);
        }
      }
    });
  } while (queue.length);

  return best;
};

/**
 * Returns a function which accepts the names of two nodes in the given graph
 * and returns the precomputed distance between those two nodes.
 *
 * @param {Map} graph - the graph to evaluate
 * @returns {Function} - the lookup function
 */
const buildDistanceLookupTable = graph => {
  const table = new Map();
  const buildKey = (key1, key2) => {
    if (key1 > key2) {
      const temp = key1;
      key1 = key2;
      key2 = temp;
    }

    return key1 + '-' + key2;
  };
  const keys = [ ...graph.keys() ];
  keys.forEach(key1 => {
    const start = graph.get(key1);
    const queue = [ { node: start, distance: 0, visited: [ start ] } ];

    do {
      const { node, distance, visited } = queue.shift();
      node.edges
        .filter(edge => !visited.includes(edge.node))
        .forEach(edge => {
          const next = {
            node: edge.node,
            distance: distance + edge.distance,
            visited: [ ...visited, edge.node ],
          };
          const key = buildKey(key1, edge.node.id);
          const currentShortest = table.get(key);
  
          if (currentShortest === undefined || currentShortest > next.distance) {
            table.set(key, next.distance);
          }

          queue.push(next);
        });
    } while (queue.length);
  });

  return (key1, key2) => table.get(buildKey(key1, key2));
};
