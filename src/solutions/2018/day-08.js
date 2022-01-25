const { add } = require('../math2');
const { split } = require('../util');

/**
 * # [Advent of Code 2018 Day 8](https://adventofcode.com/2018/day/8)
 *
 * See `parseNode()`, `sumMetadata()` and `getValue()` for the algorithms
 * for parsing the input, and computing the answers for parts one and two,
 * respectively.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const licenseTree = parse(input);
  return [ sumMetadata(licenseTree), getValue(licenseTree) ];
};

/**
 * Parses the puzzle input into a license tree.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the license tree
 */
const parse = input => {
  const license = split(input, { delimiter: ' ', parseInt: true });
  return parseNode(license, 0);
};

/**
 * Algorithm for parsing a node in the license tree, given an array of input
 * numbers, and starting with `index = 0`:
 *
 * 1. Create a new object, `node`, with an empty `children` array, and with a
 *    `width` of `2`.
 * 2. Set `childCount` to the value at `index`.
 * 3. Increment `index`.
 * 4. Set `metadataLength` to the value at `index`.
 * 5. Increment `index`.
 * 6. For each child:
 *    1. Recurse this algorithm, passing in the current value of `index`, and
 *       receiving a `child` node.
 *    2. Increase `node.width` by `child.width`.
 *    3. Increase `index` by `child.width`.
 *    4. Push `child` onto `node.children`.
 * 6. Starting with `index`, take the next `metadataLength` values from the
 *    array as a new array. Store this array under `node.metadata`.
 * 7. Increase `node.width` by `metadataLength`.
 * 8. Return `node`.
 *
 * @param {Array} license - the license values 
 * @param {number} index - the current index in the license array
 * @returns {Object} - the parsed node object
 */
 const parseNode = (license, index) => {
  const node = {
    children: [],
    width: 2,
  };

  const childCount = license[index++];
  const metadataLength = license[index++];

  for (let i = 0; i < childCount; i++) {
    const child = parseNode(license, index);
    node.width += child.width;
    index += child.width;
    node.children.push(child);
  }

  node.metadata = license.slice(index, index + metadataLength);
  node.width += metadataLength;
  return node;
};

/**
 * Computes the sum of all metadata entries for this node and all of its
 * descendants. Computing this for the root node of the license tree produces
 * the answer to part one.
 *
 * Algorithm:
 *
 * 1. Sum the metadata entries for this node.
 * 2. Recurse for each child node, and add the return values to the sum.
 * 3. Return the sum.
 *
 * @param {Object} node - the node to compute the sum for
 * @returns {number} - the sum of all metadate entries at or under this node
 */
const sumMetadata = node => add(node.metadata) +
  node.children.reduce((sum, child) => sum + sumMetadata(child), 0);

/**
 * Computes the value of this node. Computing this for the root node of the
 * license tree produces the answer to part two.
 *
 * Algorithm:
 *
 * 1. If this node has no children, return the sum of it metadata entries.
 * 2. Otherwise, convert each metadata entry to a value:
 *    1. The metadata entry indicates a child number (one-based): `1` is this
 *       node's first child (at index `0`), `2` is the second child, and so on.
 *    2. If this child number is valid, recurse to compute the value of that
 *       child; otherwise, the value is `0`.
 * 3. Return the sum of all the values computed from the metadata entries.
 *
 * @param {Object} node - the node whose value is to be computed
 * @returns {number} - the value of this node
 */
const getValue = node => {
  if (node.children.length) {
    return node.metadata.reduce((sum, childNumber) => {
      const child = node.children[childNumber - 1];
      return sum + (child ? getValue(child) : 0);
    }, 0);
  }

  return add(node.metadata);
};
