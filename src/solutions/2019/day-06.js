const { split } = require('../util');

const LINE_REGEXP = /^(?<orbitee>\w+)\)(?<orbiter>\w+)$/;

/**
 * This puzzle gives us an input that describes an orbital model. Each object in
 * the model has a name. All except the object named `COM` are orbiting some
 * other object in the model. Each line in the input describes a single orbital
 * relationship with the following syntax:
 * 
 * ```
 * <orbitee>)<orbiter>
 * ```
 *
 * For example, `B)C` means that `C` directly orbits `B`. The puzzle gives us
 * the following example in part one:
 *
 * ```
 *         G - H       J - K - L
 *        /           /
 * COM - B - C - D - E - F
 *                \
 *                 I
 * ```
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part to return
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const tree = buildTree(input);

  if (part) {
    return parts[part - 1](tree);
  }

  return parts.map(fn => fn(tree));
};

/**
 * Builds a tree representing the relationships between orbiting bodies.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the root node in the tree (COM)
 */
const buildTree = input => {
  const nodes = new Map();

  /**
   * Retrieves the node with the given name, creating it if it doesn't exist.
   *
   * @param {string} name - the name of the node
   * @returns {Object} - the node
   */
  const getNode = name => {
    if (nodes.has(name)) {
      return nodes.get(name);
    }

    const node = { name, children: [] };
    nodes.set(name, node);
    return node;
  };

  const com = getNode('COM');
  parse(input).forEach(rel => {
    const orbitee = getNode(rel.orbitee);
    const orbiter = getNode(rel.orbiter);
    orbitee.children.push(orbiter);
  });

  /**
   * Finds a path from COM to the named node.
   *
   * @param {string} target - the name of the target node
   * @returns {Array} - an array of all node names along the path, or `null` if
   * no path exists
   */
  const findPath = targetName => {
    if (targetName === 'COM') {
      return [ com ];
    }

    const queue = [ [ 'COM' ] ];

    while (queue.length) {
      const path = queue.shift();
      const location = nodes.get(path[path.length - 1]);

      for (let child of location.children) {
        const subpath = [ ...path, child.name ];

        if (child.name === targetName) {
          return subpath;
        }

        queue.push(subpath);
      }
    }

    return null;
  };

  return {
    com,
    nodes,
    findPath,
  };
};

/**
 * Computes the answer for part one, which asks for the total number of direct
 * and indirect orbits in the model. For the example given in the puzzle, here
 * is a list of the direct indirect orbits from this model:
 *
 * | Name | Direct | Indirect   |  Count |
 * | :--- | :----- | :--------- | -----: |
 * | COM  | B      | CDEFGHIJKL |     11 |
 * | B    | CG     | DEFHIJKL   |     10 |
 * | C    | D      | EFIJKL     |      7 |
 * | D    | EI     | FJKL       |      6 |
 * | E    | FJ     | KL         |      4 |
 * | F    |        |            |      0 |
 * | G    | H      |            |      1 |
 * | H    |        |            |      0 |
 * | I    |        |            |      0 |
 * | J    | K      | L          |      2 |
 * | K    | L      |            |      1 |
 * | L    |        |            |      0 |
 * |      |        |            | **42** |
 *
 * @param {Object} tree - the tree
 * @returns {number} - the answer
 */
const part1 = tree => {
  countDescendants(tree.com);
  return [ ...tree.nodes.values() ].reduce((sum, node) => sum + node.descendants, 0);
};

/**
 * Computes the answer for part two, which asks us to find the number of
 * orbital transfers required to get the object orbited by `YOU` to the object
 * orbited by `SAN`. In the example, the model has been updated to put `YOU` in
 * orbit around `K` and `SAN` around `I`, like this:
 *
 * ```
 *                           YOU
 *                          /
 *         G - H       J - K - L
 *        /           /
 * COM - B - C - D - E - F
 *                \
 *                 I - SAN
 * ```
 *
 * The path from `K` to `I` is:
 *
 * ```
 * K -> J -> E -> D -> I
 * ```
 *
 * ...which is four orbital transfers. To determine this transfer count, we
 * first perform breadth-first searches from `COM` to `YOU` and `SAN`, saving
 * the paths for each:
 *
 * ```
 * COM -> B -> C -> D -> E -> J -> K -> YOU
 * COM -> B -> C -> D -> I -> SAN
 * ```
 *
 * Then trim them to the common ancester (`D`):
 *
 * ```
 * D -> E -> J -> K -> YOU
 * D -> I -> SAN
 * ```
 *
 * We don't count the `YOU` and `SAN` nodes, nor the node that `YOU` starts at
 * (`K`), and `D` should only be counted once. So to find the number of
 * transfers, we simply add the lengths of these two paths and subtract four.
 *
 * @param {Object} tree - the tree
 * @returns {number} - the answer
 */
const part2 = tree => {
  // Find paths from COM to YOU and SAN.
  const youPath = tree.findPath('YOU');
  const santaPath = tree.findPath('SAN');

  // Find the first common node.
  let i = 0;
  let len = Math.min(youPath.length, santaPath.length);
  while (++i < len && youPath[i] === santaPath[i]);
  i--;

  // Trim off everything before the common node.
  youPath.splice(0, i);
  santaPath.splice(0, i);

  return youPath.length + santaPath.length - 4;
};

/**
 * Parses the input into an array of relationships. Each relationship is an
 * object with the `orbitee` and `orbiter` properties, each set to the name of
 * the corresponding node.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the relationships
 */
const parse = input => split(input).map(line => {
  const match = line.match(LINE_REGEXP);
  return match.groups;
});

/**
 * Returns the number of descendants the given node has. The count is also
 * stored in the node's `descendants` property. This function works by
 * recursing on all the nodes children.
 *
 * @param {Object} node - the node whose descendants should be counted
 * @returns {number} - the number of descendants
 */
const countDescendants = node => {
  const descendants = node.children.length + node.children.reduce((count, node) => {
    return count + countDescendants(node);
  }, 0);
  node.descendants = descendants;
  return descendants;
};

const parts = [ part1, part2 ];
