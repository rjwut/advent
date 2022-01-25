const { split: splitInput } = require('../util');

const EXPLODE_CHECK = (node, depth) => depth > 3 &&
  typeof node[0] === 'number' && typeof node[1] === 'number';

/**
 * # [Advent of Code 2021 Day 18](https://adventofcode.com/2021/day/18)
 *
 * I have represented each snailfish number as an array with two elements, with
 * an additional `parent` property to link it back to its parent. This has the
 * advantage that most of the parsing work can be done with `JSON.parse()`, and
 * I only have to walk the resulting tree to create the `parent` properties.
 *
 * I broke various operations on the tree into separate functions; read their
 * documentation for details. Since these operations are fairly complicated,
 * I exposed them as properties of the `solver` function, which allowed me to
 * test them independently.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = input => [ part1(input), part2(input) ];

/**
 * Computes the magnitude of the sum of the input snailfish numbers (the answer
 * to part one).
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the answer to part one
 */
const part1 = input => {
  const numbers = parse(input);
  return magnitude(add(numbers));
};

/**
 * Computes the largest possible magnitude of the sum of any two of the input
 * snailfish numbers. There are three things to be careful about when doing
 * this:
 *
 * 1. Number objects are modified when they get reduced, so we can't reuse
 *    number instances between iterations; they must be re-parsed each time.
 * 2. Don't try adding a number to itself. The problem says to seek the largest
 *    sum of _any two_ snailfish numbers.
 * 3. Because snailfish addition is not commutative, we have to try both
 *    `n1 + n2` and `n2 + n1`.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the answer to part two
 */
const part2 = input => {
  const lines = splitInput(input);
  let maxMagnitude = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines.length; j++) {
      if (i === j) {
        continue;
      }

      const number1 = parseLine(lines[i]);
      const number2 = parseLine(lines[j]);
      const sum = addTwoTerms(number1, number2);
      maxMagnitude = Math.max(maxMagnitude, magnitude(sum));
    }
  }

  return maxMagnitude;
};

/**
 * Parses the puzzle input into an array of snailfish numbers.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the snailfish numbers
 */
const parse = input => splitInput(input).map(parseLine);

/**
 * Each input line is valid JSON, so we just sic `JSON.parse()` on it, then
 * crawl the resulting tree to link children back to their parents so that
 * the relationships are bidirectional.
 *
 * @param {string} line - the input line
 * @returns {Array} - a snailfish number
 */
 const parseLine = line => {
  const root = JSON.parse(line);
  const stack = [ root ];

  do {
    const node = stack.pop();
    node.forEach(child => {
      if (Array.isArray(child)) {
        child.parent = node;
        stack.push(child);
      }
    });
  } while (stack.length);

  return root;
};

/**
 * Adds the given list of snailfish numbers.
 *
 * @param {Array} numbers - the numbers to add
 * @returns {Array} - the sum
 */
const add = numbers => {
  let sum = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    sum = addTwoTerms(sum, numbers[i]);
  }

  return sum;
};

/**
 * Adds two snailfish numbers and returns the reduced result.
 *
 * @param {Array} number1 - the first number
 * @param {Array} number2 - the second number
 * @returns {Array} - the sum
 */
const addTwoTerms = (number1, number2) => {
  const newNumber = [ number1, number2 ];
  number1.parent = newNumber;
  number2.parent = newNumber;
  return reduce(newNumber);
};

/**
 * Recursively computes the magnitude of the given snailfish number.
 *
 * @param {Array} number - the snailfish number 
 * @returns {number} - the magnitude
 */
const magnitude = number => {
  const children = number.map(
    child => typeof child === 'number' ? child : magnitude(child)
  );
  return 3 * children[0] + 2 * children[1];
};

/**
 * Reduces the given snailfish number. This runs in a loop until both
 * `explode()` and `split()` return `false`, and we never run `split()` in an
 * iteration where `explode()` returns `true`.
 *
 * Note that returning the reduced number is a convenience; the original number
 * is modified by `reduce()`. This is done to avoid doing a lot of expensive
 * array cloning.
 *
 * @param {Array} number - the snailfish number
 * @return {Array} - the reduced number
 */
const reduce = number => {
  do {
    if (!explode(number)) {
      if (!split(number)) {
        return number;
      }
    }
  } while (true);
};

/**
 * Performs the explode step while reducing a snailfish number. There are three
 * steps:
 *
 * 1. Search the tree for a node of depth `4`; return `false` if none is found.
 * 2. Seek left for a number to which to add the left term.
 * 3. Seek right for a number to which to add the right term.
 * 4. Replace this node with `0`.
 * 5. Return `true`.
 *
 * @param {Array} number - the snailfish number being reduced
 * @returns {boolean} - whether an explosion occurred
 */
const explode = number => {
  const node = depthFirstNodeSearch(number, EXPLODE_CHECK);

  if (node) {
    explodeSeek(node, 0);
    explodeSeek(node, 1);
    const side = node.parent[0] === node ? 0 : 1;
    node.parent[side] = 0;
    return true;
  }

  return false;
};

/**
 * Seek left (`dir` is `0`) or right (`dir` is `1`) to find a number to add to
 * for an explosion. The algorithm is as follows:
 *
 * 1. Note the number to add, which is the child of the exploding node in the
 *    seek direction.
 * 2. Search up the tree for the nearest ancester where the exploding node is
 *    on the opposite side of its descendants from the seek direction. If we
 *    get to the root without finding one, we don't add anything for this side
 *    of the explosion.
 * 3. If this node has a number child in the seek direction, add to it and
 *    return.
 * 4. Descend into the child of this node in the seek direction.
 * 5. While the current node has a child in the opposite side of the seek
 *    direction that is not a number, descend into that child.
 * 6. Add the number to add to the number child of the current node on the
 *    opposite side of the seek direction is the number to which to add.
 *
 * @param {Array} node - the node to explode
 * @param {number} dir - `0` to seek left, `1` to seek right
 */
 const explodeSeek = (node, dir) => {
  const opposite = dir === 0 ? 1 : 0;
  const numberToAdd = node[dir];

  // First, seek the nearest ancestor where this node is on the opposite side
  // of its descendants from the seek direction.
  while (node?.parent?.[opposite] !== node) {
    node = node.parent;
  }

  if (node) {
    // Parent of this node is the ancestor we're seeking.
    node = node.parent;
  } else {
    // Climbed all the way up the tree; can't seek further.
    return;
  }

  // Is the child in our seek direction a number?
  if (typeof node[dir] === 'number') {
    // Yes; add to it.
    node[dir] += numberToAdd;
    return;
  }

  // It's not a number, so descend into it, then start descending against the
  // seek direction.
  node = node[dir];

  while (!(typeof node[opposite] === 'number')) {
    node = node[opposite];
  }

  // We've found a number; add to it.
  node[opposite] += numberToAdd;
};

/**
 * Performs the split step while reducing a snailfish number.
 *
 * @param {Array} number - the snailfish number being reduced
 * @returns {boolean} - whether a split occurred
 */
const split = number => {
  const result = depthFirstLeafSearch(
    number,
    value => value > 9,
  );

  if (result) {
    const left = Math.floor(result.value / 2);
    const right = result.value - left;
    const newNode = [ left, right ];
    newNode.parent = result.node;
    result.node[result.side] = newNode;
    return true;
  }

  return false;
};

/**
 * Searches the tree for a node that satisfies the given condition. The search
 * is depth-first and children-first; this ensures that any discovered node is
 * the leftmost node in the number that satisfies the condition.
 *
 * @param {Array} node - the node to search from
 * @param {Function} check - the condition to check; the function will receive
 * a reference to the current node and its depth
 * @param {number} [depth=0] - the current depth 
 * @returns {Array|undefined} - the leftmost node that satisfies the condition,
 * or `undefined` if none is found
 */
const depthFirstNodeSearch = (node, check, depth = 0) => {
  let found;

  if (Array.isArray(node[0])) {
    found = depthFirstNodeSearch(node[0], check, depth + 1);
  }

  if (!found && Array.isArray(node[1])) {
    found = depthFirstNodeSearch(node[1], check, depth + 1);
  }

  if (!found && check(node, depth)) {
    found = node;
  }

  return found;
};

/**
 * Searches the tree for a leaf that satisfies the given condition. The search
 * is depth-first and checks the left child (or its descendants if it's not a
 * number) before the right child. This ensures that any discovered leaf is the
 * leftmost leaf in the number that satisfies the condition. If a matching leaf
 * is found, the returned object has the following properties:
 *
 * - `node`: The parent node of the leaf
 * - `side`: `0` if the leaf is on the leaf, `1` if it's on the right
 * - `value`: The value of the leaf
 *
 * @param {Array} startNode - the node to search from 
 * @param {Function} check - the condition to check; the function will receive
 * the value of the current leaf
 * @returns {object|undefined} - a result object if a matching leaf is found;
 * `undefined` otherwise
 */
const depthFirstLeafSearch = (startNode, check) => {
  const stack = [
    { node: startNode, side: 1 },
    { node: startNode, side: 0 },
  ];

  do {
    const { node, side } = stack.pop();
    const child = node[side];

    if (typeof child === 'number') {
      if (check(child)) {
        return { node, side, value: child };
      }
    } else {
      stack.push({ node: child, side: 1 });
      stack.push({ node: child, side: 0 });
    }
  } while (stack.length);
};

module.exports = solver;
solver.parseLine = parseLine;
solver.add = add;
solver.explode = explode;
solver.magnitude = magnitude;
