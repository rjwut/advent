const DIRECTIONS = [
  [ -1,  0 ], // north
  [  0, -1 ], // west
  [  0,  1 ], // east
  [  1,  0 ], // south
];

/**
 * Several Advent of Code puzzles require you to navigate through a maze-like
 * area in a two-dimensional grid. This module facilitates reading such a grid
 * and converting it to a graph. You may pass it a two-dimensional array of
 * characters, or a multi-line string which will be split on newlines and
 * converted to a two-dimensional array.
 * 
 * Any character that is not a wall (`#` by default) or open space (`.` by
 * default) is considered a node. Nodes are represented by objects with the
 * following properties:
 *
 * - `id`: A unique identifer for the node. By default, this will be the
 *   character representing the node in the grid.
 * - `coords`: A two-element array containing the coordinates of the node, row
 *   first, then column.
 * - `edges`: An array of graph edges connected to this node. Each edge is an
 *   object with the following properties:
 *   - `node`: A reference to the node at the other end of the edge.
 *   - `distance`: The number of steps required to travel from this node to the
 *     other. Each open space between the two nodes is one step. If two nodes
 *     are directly adjacent to one another with no open spaces between them,
 *     the distance will be `1`.
 *
 * The options object allows you to customize how the graph is constructed:
 *
 * - `wall` (default = `'#'`): The character that represents walls in the grid.
 *   A wall is considered impassible.
 * - `open` (default = `'.'`): The character that represents open spaces in the
 *   grid. Open spaces may be traversed to seek edges between nodes.
 * - `buildNode` (`Function`, optional): A function that will be invoked to
 *   create new nodes. The function will receive three arguments: the row
 *   coordinate, the column coordinate, and the character at that location in
 *   the grid. It should return an object which represents the node. This
 *   object will have the `coords` and `edges` parameters added to it
 *   afterward, so there is no need to provide them. You may optionally provide
 *   an `id` property on the node; if present, it will override the default ID
 *   for the node (the character at the grid location). This is useful if the
 *   characters for the nodes are not unique, or if you want to use a different
 *   ID. You may add any other properties you wish to the node as well. You may
 *   also return `false` to prevent creation of the node. If the `buildNode`
 *   function is omitted, only the default properties will be present on the
 *   nodes.
 * - `buildEdge` (`Function`, optional): A function that will be invoked to
 *   create new edges. The function will receive two arguments: the source node
 *   and the destination node, and the resulting edge object will become a
 *   child of the source node. It should return an object with whatever
 *   properties you wish to include on the edge. This object will have the
 *   `node` and `distance` properties added to it afterward, so there is no
 *   need to provide them. You may also return `false` to prevent creation of
 *   the edge. If the `buildEdge` function is omitted, only the `node` and
 *   `distance` properties will be present on the edges. Note that edges are
 *   one direction; normally, there will be an edge in each direction.
 *
 * The returned `Map` contains each node in the graph keyed under their
 * respective IDs.
 *
 * @param {string|Array} grid - the grid to convert to a graph
 * @param {Object} [options] - the options object
 * @returns {Map} - the resulting graph
 */
module.exports = (grid, options = {}) => {
  if (typeof grid === 'string') {
    grid = grid.replaceAll('\r', '').split('\n')
      .map(row => [ ...row ])
      .filter(row => row.length);
  }

  options = {
    open: '.',
    wall: '#',
    ...options,
  };
  const height = grid.length;
  const width = grid[0].length;
  let nodes = new Map();

  /**
   * Scans through the grid to locate nodes and create objects for them. They
   * are initially stored by their coordinates rather than their ID, so that
   * they can be easily looked up when creating edges.
   */
  const collectNodes = () => {
    for (let r = 0; r < height; r++) {
      const row = grid[r];

      for (let c = 0; c < width; c++) {
        const chr = row[c];

        if (chr !== options.open && chr !== options.wall) {
          let node = options.buildNode?.(chr, r, c);

          if (node === false) {
            continue;
          }

          node = {
            id: chr,
            ...node,
            coords: [ r, c ],
            edges: [],
          };
          nodes.set(`${r},${c}`, node);
        }
      }
    }
  };

  /**
   * Searches through the grid to find and create edges between nodes and
   * calculate their distances.
   */
  const connectNodes = () => {
    const nodeList = [ ...nodes.values() ];

    while (nodeList.length) {
      const start = nodeList.pop();
      const queue = [
        {
          coords: start.coords,
          distance: 0,
        },
      ];
      const visited = new Set();
      visited.add(start.coords.join())

      do {
        const entry = queue.shift();
        const newDistance = entry.distance + 1;
        DIRECTIONS.forEach(delta => {
          const newCoords = entry.coords.map((c, i) => c + delta[i]);
          const coordsKey = newCoords.join();

          if (
            newCoords[0] < 0 ||
            newCoords[0] >= height ||
            newCoords[1] < 0 ||
            newCoords[1] >= width ||
            visited.has(coordsKey)
          ) {
            return;
          }

          const chr = grid[newCoords[0]][newCoords[1]];

          if (chr === options.wall) {
            return;
          }

          visited.add(coordsKey);

          if (chr !== options.open) {
            const node = nodes.get(coordsKey);
            let edge = options.buildEdge?.(start, node);

            if (edge === false) {
              return;
            }

            start.edges.push({
              ...edge,
              node,
              distance: newDistance,
            });
            return;
          }

          queue.push({
            coords: newCoords,
            distance: newDistance,
          });
        });
      } while (queue.length);
    }
  };

  collectNodes();
  connectNodes();
  nodes = [ ...nodes.values() ].reduce((set, node) => {
    set.set(node.id, node);
    return set;
  }, new Map());

  /**
   * Returns a string which describes the graph.
   *
   * @returns {string} - the descriptive string
   */
  nodes.toString = () => {
    return [ ...nodes.values() ].map(node => {
      const edges = node.edges.map(edge => `${edge.node.id}=${edge.distance}`).join(', ');
      return `${node.id} (${node.coords.join()}): ${edges}`;
    }).join('\n');
  };

  return nodes;
};
