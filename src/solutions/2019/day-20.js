const gridToGraph = require('../grid-to-graph');

const PORTAL_CHAR = '@';
const WALL_CHAR = '#';

/**
 * # [Advent of Code 2019 Day 20](https://adventofcode.com/2019/day/20)
 *
 * I can reuse my `grid-to-graph` module, but I have to make a few adjustments,
 * first:
 *
 * 1. There are two characters that are impassible: `#` and spaces. I converted
 *    all the spaces to `#`'s.
 * 2. I placed a `@` character at the location of each portal and removed their
 *    labels. I created a lookup table that maps the portal's coordinates to
 *    its ID.
 *
 * After the graph is built, I match up all the portal pairs. The first step is
 * to determine which are the outer portals and which are the inner ones. The
 * outer portals are all located where `x = 2`, `x = width - 3`, `y = 2`, or
 * `y = height - 3`. Any portal for which this is not true is an inner portal.
 * In order to distinguish the two portals in each pair, I append `'O'` to the
 * outer portal IDs, and `'I'` to the inner ones.
 *
 * The `grid-to-graph` module isn't aware that the portal pairs are connected,
 * so after the graph is generated, I manually add the edges between the pairs.
 * Each edge has an additional `depth` property added. It is `1` for going from
 * an inner portal to its corresponding outer portal, `-1` for the other
 * direction, and `0` for all other edges. This property is ignored in part
 * one, but is used to track recursion depth for part two.
 *
 * For both parts, I use a breadth-first search to find the shortest path.
 *
 * Part one:
 *
 * 1. Set up a distances `Map`.
 * 2. Enqueue the `AAO` node with a distance of `0`.
 * 3. Dequeue the next entry.
 * 4. Fetch the distance value for this node from the `Map`. Use `Infinity` if
 *    no distance has yet been recorded.
 * 5. If the distance from the queue entry is not less than the previous
 *    distance, go to step 8.
 * 6. Update the distance in the `Map`.
 * 7. Enqueue each of the node's edges with the current distance.
 * 8. If the queue is not empty, go to step 3.
 * 9. Return the distance for the `ZZO` node, or `Infinity` (no path) if no
 *    distance has been recorded.
 *
 * Part two:
 *
 * The search works much the same as part one, with the following differences:
 *
 * 1. We now keep a depth property with each entry in the queue. It starts at
 *    `0`. Every time we traverse an edge, we add its `depth` property (if it
 *    has one) to the entry's `depth`.
 * 2. Instead of just using node IDs for the keys in the distances `Map`, we
 *    use `<nodeId>/<depth>` as the key to differentiate between the portals at
 *    different depths.
 * 3. We stop following a search branch if any of the following conditions
 *    occur:
 *    - We encounter the `AAO` or `ZZO` portals while `depth` is not `0`, or a
 *      portal other than `AAO` or `ZZO` while `depth` is `0`. (These portals
 *      are to be treated as walls according to the puzzle description.)
 *    - Its distance is greater than the current distance recorded under the
 *      `ZZO/0` key in the distances `Map`.
 *
 * This last condition is neccessary because the addition of the `depth`
 * dimension to the search creates a logically infinite graph, resulting in a
 * neverending search. Since a path that is already longer that a known path to
 * the exit is not the answer we're looking for, we can stop searching.
 *
 * When the queue empties, the answer is the distance recorded under the
 * `ZZO/0` key in the distances `Map`. If it is absent, the answer is
 * `Infinity` (no path). Note that if there is no path to the exit, but a path
 * does exist that results in infinite recursion, part two will never
 * terminate. Fortunately, the input is designed not to have this problem, but
 * if we wanted to, we could introduce a `depth` limit to prune any search
 * branch that went that deep.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = parse(input);
  return [ part1, part2 ].map(fn => fn(graph));
};

/**
 * Finds the path from `AA` to `ZZ` for the single-level graph.
 *
 * @param {Map} graph - the graph
 * @returns {number} - the length of the path
 */
const part1 = graph => {
  const distances = new Map();
  const queue = [ { node: graph.get('AAO'), distance: 0 } ];

  do {
    const entry = queue.shift();
    const prevDistance = distances.get(entry.node.id) || Infinity;

    if (entry.distance < prevDistance) {
      distances.set(entry.node.id, entry.distance);
      entry.node.edges.forEach(edge => {
        queue.push({ node: edge.node, distance: entry.distance + edge.distance });
      });
    }
  } while (queue.length);

  return distances.get('ZZO') ?? Infinity;
};

/**
 * Finds the path from `AA` to `ZZ` for the infinite recursion graph.
 *
 * @param {Map} graph - the graph
 * @returns {number} - the length of the path
 */
const part2 = graph => {
  const distances = new Map();
  distances.set('ZZO/0', Infinity);
  const queue = [ { node: graph.get('AAO'), distance: 0, depth: 0 } ];

  do {
    const entry = queue.shift();

    if (distances.get('ZZO/0') < entry.distance) {
      continue;
    }

    const distanceKey = `${entry.node.id}/${entry.depth}`;
    const prevDistance = distances.get(distanceKey) ?? Infinity;

    if (entry.distance < prevDistance) {
      distances.set(distanceKey, entry.distance);
      entry.node.edges.forEach(edge => {
        if ((edge.node.id === 'AAO' || edge.node.id === 'ZZO') && entry.depth > 0) {
          return; // AA and ZZ are walls at depth > 0
        }

        if (edge.depth === -1 && entry.depth === 0) {
          return; // outer portals are walls at depth === 0
        }

        if (edge.depth === 1 && entry.depth === graph.size) {
          return; // no need to go deeper than the number of portals
        }

        queue.push({
          node: edge.node,
          distance: entry.distance + edge.distance,
          depth: entry.depth + edge.depth,
        });
      });
    }
  } while (queue.length);

  return distances.get('ZZO/0');
};

/**
 * Parses the input into the graph.
 *
 * @param {string} input - the puzzle input
 * @returns {Map} - the graph
 */
const parse = input => {
  const grid = input.replaceAll('\r', '').split('\n')
    .map(row => [ ...row ])
    .filter(row => row.length);

  if (grid[grid.length - 1].length === 0) {
    grid.pop();
  }

  const height = grid.length;
  const halfHeight = height / 2;
  const width = grid[0].length;
  const halfWidth = width / 2;
  const top = 0;
  const bottom = height - 2;
  const left = 0;
  const right = width - 2;
  const portals = {};

  /**
   * Prepares the grid to be parsed into a graph:
   *
   * 1. Converts all spaces to `#` characters.
   * 2. Places `@` characters where the portals are located and removes the
   *    labels, putting the IDs into a lookup table.
   */
  const cleanGrid = () => {
    for (let r = 0; r < height; r++) {
      const row = grid[r];
  
      for (let c = 0; c < width; c++) {
        const chr = row[c];
  
        if (isPortalChar(chr)) {
          parsePortal(r, c, chr);
        } else if (chr === ' ') {
          grid[r][c] = WALL_CHAR;
        }
      }
    }
  };

  /**
   * Handles the parsing of a single portal label.
   *
   * @param {number} r - the row for the label's first character
   * @param {nunber} c - the column for the label's first character 
   * @param {string} chr - the character at that location
   */
  const parsePortal = (r, c, chr) => {
    grid[r][c] = WALL_CHAR;
    let nextChr = grid[r][c + 1];
    let horiz = false;

    if (isPortalChar(nextChr)) {
      grid[r][c + 1] = WALL_CHAR;
      horiz = true;
    } else {
      nextChr = grid[r + 1][c];
      grid[r + 1][c] = WALL_CHAR;
    }

    const id = chr + nextChr;
    let pr, pc;

    if (horiz) {
      pr = r;

      if (c === left || (c !== right && c > halfWidth)) {
        pc = c + 2;
      } else {
        pc = c - 1;
      }
    } else {
      pc = c;

      if (r === top || (r !== bottom && r > halfHeight)) {
        pr = r + 2;
      } else {
        pr = r - 1;
      }
    }

    grid[pr][pc] = PORTAL_CHAR;
    portals[`${pr},${pc}`] = id;
  };

  /**
   * Builds the graph from the grid.
   *
   * @returns {Map} - the graph
   */
  const buildGraph = () => {
    return gridToGraph(grid, {
      buildNode: (_, r, c) => {
        const id = portals[`${r},${c}`];
        const outer = r === 2 || r === height - 3 || c === 2 || c === width - 3;
        return { id: id + (outer ? 'O' : 'I') };
      },
      buildEdge: () => ({ depth: 0 }),
    });
  };

  cleanGrid();
  const graph = buildGraph();
  connectPortals(graph);
  return graph;
};

/**
 * Adds edges to the graph to connect portal pairs.
 *
 * @param {Map} graph - the graph
 */
const connectPortals = graph => {
  [ ...graph.entries() ].forEach(([ id, node ]) => {
    if (id === 'AAO' || id === 'ZZO') {
      return;
    }

    const pairId = id.substring(0, 2);
    const endId = id.charAt(2);
    const otherEndId = endId === 'O' ? 'I' : 'O';
    const otherId = pairId + otherEndId;
    node.edges.push({
      node: graph.get(otherId),
      distance: 1,
      depth: endId === 'I' ? 1 : -1,
    });
  });
};

/**
 * Returns whether the given character is part of a portal label.
 *
 * @param {string} chr - the character to check
 * @returns {boolean} - `true` if it's part of a portal label; `false`
 * otherwise
 */
const isPortalChar = chr => chr >= 'A' && chr <= 'Z';
