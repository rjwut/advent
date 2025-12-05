const { split } = require('../util');

/**
 * # [Advent of Code 2023 Day 25](https://adventofcode.com/2023/day/25)
 *
 * I've been on a long journey to what ultimately lead to the this solution. Back when this puzzle
 * was first released, I solved it using a third-party graph solution, but was never satisfied with
 * not having written the code that directly solves it. Some time later, I revisited this after
 * having read about [Karger's algorithm](https://en.wikipedia.org/wiki/Karger%27s_algorithm). This
 * resulted in my being able to find the solution without relying on an external tool, but the
 * non-deterministic nature of the algorithm made is so that runtime was unpredictable, ranging from
 * a couple seconds to a couple minutes.
 *
 * Finally, two years after the puzzle was released, I ran across a description of a different
 * strategy that resulted in the current solution, which I describe here:
 *
 * 1. Put all nodes in the graph into a set of unvisited nodes.
 * 2. Create an empty set of visited nodes.
 * 3. Find any node in the unvisited set with the most edges, and move it to the visited set.
 * 4. Create a bridge set containing all edges that connect the visited and unvisited sets (which
 *    is currently all edges connected to the single node in the visited set).
 * 5. While the number of edges in the bridge set is greater than three:
 *    1. Find the node with the most edges in the bridge set. If there is more than one such node,
 *       pick any one of them.
 *    2. Move that node from the unvisited set to the visited set.
 *    3. Remove any edges from the bridge set that connect to the newly-visited node, and add any
 *       other edges connected to that node to the bridge set.
 * 6. The edges in the bridge set are the ones to be cut, and the visited and unvisited sets now
 *    represent the two resulting subgraphs. Multiplying the number of nodes in each subgraph gives
 *    the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = new Graph(input);
  let subgraphs = graph.findMinimumCut();
  return [ subgraphs[0].size * subgraphs[1].size, undefined ];
};

/**
 * Represents the entire system of components as a graph.
 */
class Graph {
  #nodes;

  /**
   * Builds the `Graph` from the input string.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    this.#nodes = new Map();
    const lines = split(input);

    for (const line of lines) {
      const [ nodeId, rest ] = line.split(': ');
      const node = this.#getOrCreateNode(nodeId);
      const neighborIds = rest.split(' ');

      for (const id of neighborIds) {
        const other = this.#getOrCreateNode(id);
        const edge = new Edge();
        node.addEdge(edge);
        other.addEdge(edge);
      }
    }
  }

  /**
   * Finds the minimum cut for the graph.
   *
   * @returns {Set<Node>[]} - an array of two `Set`s of `Node`s representing the resulting subgraphs
   */
  findMinimumCut() {
    // Start with the node with the most connections
    const startNode = [ ...this.#nodes.values() ].reduce((mostConnected, node) => {
      if (node.edges.length > mostConnected.edges.length) {
        mostConnected = node;
      }

      return mostConnected;
    }, { edges: [] });
    const visited = new Set([ startNode ]);
    const unvisited = new Set(this.#nodes.values().filter(node => node !== startNode).toArray());
    const bridge = new Set(startNode.edges);

    while (bridge.size > 3) {
      // Find the most connected node
      const mostConnected = [ ...unvisited ].reduce((mostConnected, node) => {
        const connections = node.edges.filter(edge => bridge.has(edge)).length;

        if (connections > mostConnected.connections) {
          mostConnected = { node, connections };
        }

        return mostConnected;
      }, { node: null, connections: -1 }).node;

      // Move it to the visited set
      visited.add(mostConnected);
      unvisited.delete(mostConnected);
      mostConnected.edges.forEach(edge => {
        if (bridge.has(edge)) {
          bridge.delete(edge);
        } else {
          bridge.add(edge);
        }
      });
    }

    return [ visited, unvisited ];
  }

  /**
   * Retrieves the `Node` with the given ID, creating it if it doesn't already exist.
   *
   * @param {string} id - the node ID
   * @returns {Node} - the corresponding `Node`
   */
  #getOrCreateNode(id) {
    let node = this.#nodes.get(id);

    if (!node) {
      node = new Node(id);
      this.#nodes.set(id, node);
    }

    return node;
  }
}

/**
 * Represents a single component in the system.
 */
class Node {
  #id;
  #edges;

  constructor(id) {
    this.#id = id;
    this.#edges = [];
  }

  /**
   * @returns {string} - the node ID
   */
  get id() {
    return this.#id;
  }

  /**
   * @returns {Edge[]} - the edges connected to this `Node`
   */
  get edges() {
    return this.#edges;
  }

  /**
   * Adds an `Edge` to this `Node`.
   *
   * @param {Edge} edge - the `Edge` to add
   */
  addEdge(edge) {
    this.#edges.push(edge);
  }
}

/**
 * Represents a wire between two components.
 */
class Edge {}
