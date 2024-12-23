const CONNECTION_REGEXP = /^([a-z]+)-([a-z]+)$/gm;

/**
 * # [Advent of Code 2024 Day 23](https://adventofcode.com/2024/day/23)
 *
 * The first step is to parse the input into a graph. Each node (computer in the network) is
 * represented by an object with two properties:
 *
 * - `name: string`: The name of that computer
 * - `connections: Object[]`: The nodes to which this node is connected
 *
 * During parsing, I put the nodes into a `Map` so they can easily be looked up to create the
 * connections, but I then returned an array of the node objects without the `Map`, since there's no
 * need to look them up by name afterward.
 *
 * Both parts of this problem involve identifying
 * [cliques](https://en.wikipedia.org/wiki/Clique_(graph_theory)) within the graph. You can identify
 * cliques quickly using the
 * [Bron-Kerbosch algorithm](https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm).
 * However, in part one, we are looking for cliques of three nodes (which I'm calling "triads")
 * which contain at least one node whose name begins with `t`. Larger cliques would be treated as
 * multiple overlapping triads. So for part one, I decided to make things a little simpler for
 * myself and just look for triads directly instead of using the Bron-Kerbosch algorithm:
 *
 * 1. Create a `Set` named `triads`.
 * 2. Filter the nodes to only those whose names start with `t`.
 * 3. Iterate the remaining nodes:
 *    1. For every pair of connections the node has, if the other two nodes are connected to each
 *       other, we've identified a triad. Sort them by name and concatenate their names together,
 *       then add that string to the `triads` `Set`.
 * 4. The value of `triads.size` is the answer to part one.
 *
 * For part two, we just want the largest clique in the graph. We can use the Bron-Kerbosch
 * algorithm to identify all cliques, `reduce()` the array of cliques to find the largest one,
 * sort its members by name and concatenate their names together. This is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const nodes = parse(input);
  return [ part1, part2 ].map(part => part(nodes));
};

/**
 * Produce an array of nodes from the input string.
 *
 * @param {string} input - the puzzle input
 * @returns {Object[]} - the nodes in the graph
 */
const parse = input => {
  const nodes = new Map();

  /**
   * Retrieve the node with the given name, creating it if it doesn't exist yet.
   *
   * @param {string} name - the name of the node to retrieve
   * @returns {Object} - the node
   */
  const getNode = name => {
    let node = nodes.get(name);

    if (!node) {
      node = { name, connections: [] };
      nodes.set(name, node);
    }

    return node;
  };

  // Extract all connections from the input
  const lines = input.matchAll(CONNECTION_REGEXP).map(([ , a, b ]) => [ a, b ]);
  lines.forEach(([ a, b ]) => {
    // Connect these two nodes
    const nodeA = getNode(a);
    const nodeB = getNode(b);
    nodeA.connections.push(nodeB);
    nodeB.connections.push(nodeA);
  });
  return [ ...nodes.values() ];
};

/**
 * Counts the number of triads in the graph involving a node whose name starts with 't'.
 *
 * @param {Object[]} nodes - the graph
 * @returns {number} - the number of qualifying triads found
 */
const part1 = nodes => {
  const triads = new Set();
  nodes
  .filter(({ name }) => name.startsWith('t'))
  .forEach(({ name, connections }) => {
    const limit = connections.length - 1;

    for (let i = 0; i < limit; i++) {
      const node2 = connections[i];

      for (let j = 1; j < connections.length; j++) {
        const node3 = connections[j];

        if (node2.connections.includes(node3)) {
          // Found a triad!
          triads.add(
            [ name, node2.name, node3.name ].sort().join(',')
          );
        }
      }
    }
  });
  return triads.size;
};

/**
 * Implements the Bron-Kerbosch algorithm to find the largest clique in the graph.
 *
 * @param {Object[]} p - the nodes to consider
 * @param {Object[]} [r] - the nodes in the current clique
 * @param {Object[]} [x] - the nodes that have already been considered
 * @returns {Object[][]} - the discovered cliques
 */
const bronKerbosch = (p, r = [], x = []) => {
  if (!p.length && !x.length) {
    return [ r ];
  }

  const cliques = [];

  for (const v of p) {
    const newR = [ ...r, v ];
    const newP = p.filter(node => v.connections.includes(node));
    const newX = x.filter(node => v.connections.includes(node));

    cliques.push(...bronKerbosch(newP, newR, newX));
    p = p.filter(node => node !== v);
    x.push(v);
  }

  return cliques;
};

/**
 * Finds the largest clique and returns the names of its members, sorted and concatenated.
 *
 * @param {Object[]} nodes - the graph
 * @returns {string} - the answer to part two
 */
const part2 = nodes => {
  const cliques = bronKerbosch(nodes);
  const biggest = cliques.reduce(
    (biggest, clique) => clique.length > biggest.length ? clique : biggest,
    []
  );
  return biggest.map(node => node.name).sort().join(',');
};
