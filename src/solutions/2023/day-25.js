const { split } = require('../util');

/**
 * # [Advent of Code 2023 Day 25](https://adventofcode.com/2023/day/25)
 *
 * I first solved this using a third-party graph solution, but I eventually implemented
 * [Karger's algorithm](https://en.wikipedia.org/wiki/Karger%27s_algorithm) to find a cut for the
 * graph that divides it into two subgraphs. It works by repeatedly collapsing randomly-selected
 * edges in the graph, merging the two nodes they connect into a single node, until only two nodes
 * are left. The edges that remain between the final two nodes represent the edges that would be cut
 * to divide the graph.
 *
 * Because the graph is large, and there are only three edges in the minimum cut, each edge selected
 * to be collapsed is very unlikely to be part of the minimum cut, though the odds increase as the
 * graph shrinks. Therefore, the algorithm will produce a cut that is _likely_ to cut few edges and
 * _may_ be the minimum cut, but is not guaranteed to do so. Since there is only one solution to the
 * puzzle, we know that there must be exactly one cut with three edges, so we simply run the
 * algorithm repeatedly until we find a cut with three edges.
 *
 * The consequence of this approach is that performance may vary significantly between runs,
 * depending on how many times the algorithm has to be run before a cut with three edges is found.
 * I have had runs that complete in less than three seconds, and others that take nearly two
 * minutes.
 *
 * TODO Consider ways of improving performance; ideas:
 * - Search for cuts in parallel
 * - Run the algorithm X times, tracking how often each edge is found in a cut, then take the top
 *   three edges
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = new Graph(input);
  let edges;

  // Repeatedly run Karger's algorithm until we find a cut with three edges
  do {
    edges = graph.kargersAlgorithm();
    console.log(edges.length);
  } while (edges.length > 3);

  // Remove the edges in the cut and get the resulting subgraphs
  edges.forEach(({ originalA, originalB }) => {
    graph.removeEdge(originalA, originalB);
  });
  const subgraphs = graph.getDisjointSubgraphs();

  if (subgraphs.length !== 2) {
    throw new Error(`Expected exactly 2 subgraphs; got ${subgraphs.length}`);
  }

  // Multiply the sizes of the two subgraphs to get the answer
  return [ subgraphs[0].size * subgraphs[1].size, undefined ];
};

/**
 * Repesents an edge between two nodes in a graph.
 */
class Edge {
  #nodeA;
  #nodeB;
  #originalA;
  #originalB;

  /**
   * Creates an instance of the Edge class. Nodes are represented by their string IDs.
   *
   * @param {string} nodeA - the first node
   * @param {string} nodeB - the second node
   */
  constructor(nodeA, nodeB) {
    this.#nodeA = nodeA;
    this.#nodeB = nodeB;
    this.#originalA = nodeA;
    this.#originalB = nodeB;
  }

  /**
   * @param {string} newA - the node to set as the A anchor for this `Edge`
   */
  setNodeA(newA) {
    this.#nodeA = newA;
  }

  /**
   * @param {string} newB - the node to set as the B anchor for this `Edge`
   */
  setNodeB(newB) {
    this.#nodeB = newB;
  }

  /**
   * @returns {string[]} - the two nodes connected by this `Edge`
   */
  getNodes() {
    return [ this.#nodeA, this.#nodeB ];
  }

  /**
   * @returns {string[]} - the two nodes connected by this `Edge` when it was first created
   */
  getOriginalNodes() {
    return [ this.#originalA, this.#originalB ];
  }
}

/**
 * Represents an undirected graph.
 */
class Graph {
  #nodes;
  #edges;
  #adjacency;

  /**
   * Parses the input into a graph structure. Nodes are stored as a `Set` of string IDs. Edges are
   * stored as an array of `Edge` instances. An adjacency list is also maintained as a `Map` from
   * node IDs to arrays of neighboring node IDs to make it easy to find all edges connected to a
   * particular node.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    this.#nodes = new Set();
    this.#edges = [];
    this.#adjacency = new Map();
    const lines = split(input);

    for (const line of lines) {
      const [ node, rest ] = line.split(': ');
      this.#nodes.add(node);

      if (!this.#adjacency.has(node)) {
        this.#adjacency.set(node, []);
      }

      const neighbors = rest.split(' ');

      for (const neighbor of neighbors) {
        if (!this.#adjacency.has(neighbor)) {
          this.#adjacency.set(neighbor, []);
        }

        if (!this.#adjacency.get(node).includes(neighbor)) {
          const edge = new Edge(node, neighbor);
          this.#edges.push(edge);
          this.#adjacency.get(node).push(neighbor);
          this.#adjacency.get(neighbor).push(node);
        }
      }
    }
  }

  /**
   * @returns {number} - the number of nodes in the graph
   */
  get nodeCount() {
    return this.#nodes.size;
  }

  /**
   * @returns {number} - the number of edges in the graph
   */
  get edgeCount() {
    return this.#edges.length;
  }

  /**
   * Implements Karger's algorithm to find a cut that subdivides the graph into two subgraphs and
   * which is likely to be close to a minimum cut. Returns an array of edges that would have to be
   * cut to split the graph. Does not modify the original graph.
   *
   * @returns {Object[]} - the edges to be cut
   */
  kargersAlgorithm() {
    // Clone nodes and edges for the contraction process
    const nodes = new Set(this.#nodes);
    // Deep copy edges, preserving original nodes for output
    const edges = this.#edges.map(e => {
      const [a, b] = e.getNodes();
      const [originalA, originalB] = e.getOriginalNodes();
      const edge = new Edge(a, b);
      edge.setNodeA(a);
      edge.setNodeB(b);
      // Store original nodes for output
      edge.originalA = originalA;
      edge.originalB = originalB;
      return edge;
    });

    // Helper to merge two nodes
    function mergeNodes(edges, nodeA, nodeB) {
      for (const edge of edges) {
        let [a, b] = edge.getNodes();
        if (a === nodeB) edge.setNodeA(nodeA);
        if (b === nodeB) edge.setNodeB(nodeA);
      }
      // Remove self-loops
      return edges.filter(edge => {
        const [a, b] = edge.getNodes();
        return a !== b;
      });
    }

    // Contract until only two supernodes remain
    while (nodes.size > 2) {
      // Pick a random edge
      const idx = Math.floor(Math.random() * edges.length);
      const edge = edges[idx];
      const [a, b] = edge.getNodes();

      // Merge node b into node a
      nodes.delete(b);
      // Update edges
      const newEdges = mergeNodes(edges, a, b);
      edges.length = 0;
      edges.push(...newEdges);
    }

    // The remaining edges are the cut
    // Return edges with their original node pairs
    return edges.map(e => ({
      originalA: e.originalA ?? e.getOriginalNodes()[0],
      originalB: e.originalB ?? e.getOriginalNodes()[1]
    }));
  }

  /**
   * Removes the first edge found between the two specified nodes.
   *
   * @param {string} nodeA - the first anchor node
   * @param {string} nodeB - the second anchor node
   * @returns {boolean} - `true` if an edge was found and removed; `false` otherwise
   */
  removeEdge(nodeA, nodeB) {
    for (let i = 0; i < this.#edges.length; i++) {
      const edge = this.#edges[i];
      const [a, b] = edge.getNodes();

      if ((a === nodeA && b === nodeB) || (a === nodeB && b === nodeA)) {
        this.#edges.splice(i, 1);

        if (this.#adjacency.get(nodeA)) {
          this.#adjacency.get(nodeA).splice(this.#adjacency.get(nodeA).indexOf(nodeB), 1);
        }

        if (this.#adjacency.get(nodeB)) {
          this.#adjacency.get(nodeB).splice(this.#adjacency.get(nodeB).indexOf(nodeA), 1);
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Identifies disjoint subgraphs in the graph.
   *
   * @returns {Set<string>[]} - an array of sets of node IDs, each representing a disjoint subgraph
   */
  getDisjointSubgraphs() {
    const visited = new Set();
    const components = [];

    for (const node of this.#nodes) {
      if (!visited.has(node)) {
        const component = new Set();
        const stack = [ node ];

        while (stack.length) {
          const curr = stack.pop();

          if (!visited.has(curr)) {
            visited.add(curr);
            component.add(curr);

            for (const neighbor of this.#adjacency.get(curr) || []) {
              if (!visited.has(neighbor)) {
                stack.push(neighbor);
              }
            }
          }
        }

        components.push(component);
      }
    }

    return components;
  }
}
