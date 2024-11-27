const SimpleGrid = require('../simple-grid');

const Directions = [
  { dr: -1, dc:  0 },
  { dr:  0, dc:  1 },
  { dr:  1, dc:  0 },
  { dr:  0, dc: -1 },
];
const Slope = {
  '^': Directions[0],
  '>': Directions[1],
  'v': Directions[2],
  '<': Directions[3],
};

/**
 * # [Advent of Code 2023 Day 23](https://adventofcode.com/2023/day/23)
 *
 * Another pathfinding puzzle, although this once is complicated by having some one-way edges and
 * the requirement that we find the longest path that doesn't visit the same tile twice. After
 * reading in the grid, I used a breadth-first search of the grid to convert it to a graph, where
 * the start, end, and each intersection is a node. If a slope is found between two interesections,
 * they will be connected by only one (directional) edge; otherwise, they have an edge in each
 * direction.
 *
 * With the graph constructed, I then use a depth-first search of the graph to find the longest
 * path to the exit, ensuring I never visit the same node twice. If it were a shortest-path search,
 * I could prune paths that exceeded the shortest path already found, but since we want the longest
 * path, we can't do that. We also can't optimize by keeping track of the longest path to each node
 * so far and pruning if we ever reach a node sooner, since the longest path to the exit may reach
 * a particular node sooner than another. We are forced to search every possible path to find the
 * longest one.
 *
 * Part two removes the slopes from the graph. This is implemented by counting how many edges are
 * between each pair of nodes, and adding a second edge in the opposite direction if there's only
 * one. After that, the same longest-path search from part one is performed to find the answer to
 * part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = new Graph(input);
  const bestCost1 = graph.findLongestPath();
  graph.removeSlopes();
  const bestCost2 = graph.findLongestPath();
  return [ bestCost1, bestCost2 ];
};

/**
 * A directed graph that represents the maze, with the start, end, and intersections as nodes.
 * Paths that have a slope are represented by a single edge between the nodes, with those that lack
 * a slope have an edge in each direction.
 */
class Graph {
  #grid;
  #nodes;
  #start;
  #exit;

  /**
   * Construct the graph from the puzzle input.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    this.#grid = new SimpleGrid({ data: input });
    this.#nodes = new Map();
    this.#start = { pos: { r: 0, c: 1 }, edges: [] };
    this.#nodes.set('0,1', this.#start);
    let queue = [ { node: this.#start, prevPos: { r: -1, c: 1 } } ];

    do {
      const entry = queue.shift();

      if (entry.node.pos.r === this.#grid.rows - 1) {
        // This is the exit node; don't search further from here
        continue;
      }

      const directions = Directions.filter(({ dr, dc }) => {
        const nextPos = { r: entry.node.pos.r + dr, c: entry.node.pos.c + dc };

        if (nextPos.r === entry.prevPos.r && nextPos.c === entry.prevPos.c) {
          return false;
        }

        const chr = this.#grid.get(nextPos.r, nextPos.c);
        return chr !== '#';
      });
      directions.forEach(direction => {
        const result = this.#findNextNode(entry.node, direction);

        if (result) {
          if (result.node.exit) {
            // This is the exit node; don't search further from here
            this.#exit = result.node;
            return;
          }

          queue.push(result);
        }
      });
    } while (queue.length);
  }

  /**
   * @returns {SimpleGrid} - the grid that was used to construct the graph
   */
  get grid() {
    return this.#grid;
  }

  /**
   * Finds the longest path through the graph from the start node to the end node, without
   * visiting any one node twice.
   *
   * @returns {number} - the length of the longest path
   */
  findLongestPath() {
    const stack = [ { node: this.#start, cost: 0, seen: new Set() } ];
    let best = 0;

    do {
      const { node, cost, seen } = stack.pop();
      const nextSeen = new Set(seen);
      nextSeen.add(node);
      node.edges
        .filter(edge => !nextSeen.has(edge.node))
        .forEach(({ node: nextNode, cost: edgeCost }) => {
          const nextCost = cost + edgeCost;

          if (nextNode === this.#exit) {
            // This is the exit node
            if (nextCost > best) {
              best = nextCost;
            }
          } else {
            stack.push({ node: nextNode, cost: nextCost, seen: nextSeen });
          }
        });
    } while (stack.length);

    return best;
  }

  /**
   * Finds all pairs of nodes that have only one edge between them, and adds a second edge in the
   * opposite direction for any found.
   */
  removeSlopes() {
    [ ...this.#nodes.values() ].forEach(node => {
      node.edges.forEach(edge => {
        const other = edge.node;
        const reverseEdge = other.edges.find(edge => edge.node === node);

        if (!reverseEdge) {
          other.edges.push({ node, cost: edge.cost });
        }
      });
    });
  }

  /**
   * Given a node and a direction to seek, searches through the grid until it finds the next node,
   * nodes and edges as it goes. The returned object has the following properties:
   *
   * - `node: Object`: The next node found
   * - `prevPos: Object`: The position in the grid the search was at just befored finding the node
   *
   * @param {Object} node - the node to seek from
   * @param {Object} direction - the direction to seek from the node
   * @returns {Object|null} - an object describing the results of the search, or `null` if this
   * search branch should be pruned (a dead end or a previously-encountered node was found)
   */
  #findNextNode(node, direction) {
    let prevPos = node.pos;
    let pos = { r: node.pos.r + direction.dr, c: node.pos.c + direction.dc };
    let edgeDir = null;
    let cost = 1;
    let nextNode;
    let edgeCells = [];
    let existingNode;

    do {
      const chr = this.#grid.get(pos.r, pos.c);
      const slope = Slope[chr];

      if (slope) {
        // We're on a slope; does it point back to the cell we came from?
        if (pos.r + slope.dr === prevPos.r && pos.c + slope.dc === prevPos.c) {
          // Yes; we're traveling against the edge direction
          edgeDir = 'b';
        } else {
          // No; we're traveling with the edge direction
          edgeDir = 'f';
        }
      }

      let openAdjacent

      if (pos.r === this.#grid.rows - 1) {
        // We're at the exit
        nextNode = { pos, edges: [], exit: true };
      } else {
        // What adjacent cells are open (not including the one we came from)?
        openAdjacent = Directions.map(({ dr, dc }) => ({ r: pos.r + dr, c: pos.c + dc }))
          .filter(({ r, c }) => !(r === prevPos.r && c === prevPos.c) && this.#grid.get(r, c) !== '#');

        if (openAdjacent.length > 1) {
          // This is an intersection; we'll make a node here
          const key = `${pos.r},${pos.c}`;
          existingNode = this.#nodes.get(key);
          nextNode = existingNode ?? { pos, edges: [] };
        }
      }

      if (nextNode) {
        this.#nodes.set(`${pos.r},${pos.c}`, nextNode);

        if (edgeDir !== 'b' && !node.edges.find(edge => edge.node === nextNode)) {
          // Add an edge from the previous node to this one
          node.edges.push({ node: nextNode, cost });
        }

        if (edgeDir !== 'f' && !nextNode.edges.find(edge => edge.node === node)) {
          // Add an edge from this node to the previous one
          nextNode.edges.push({ node, cost });
        }
      } else if (!openAdjacent.length) {
        // We're at a dead end
        return null;
      } else {
        // We're between nodes
        edgeCells.push(pos);
        prevPos = pos;
        pos = openAdjacent[0];
        cost++;
      }
    } while (!nextNode);

    // Don't keep searching if we've already found this node
    return existingNode ? null : { node: nextNode, prevPos };
  }
}
