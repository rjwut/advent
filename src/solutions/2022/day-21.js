const { match } = require('../util');

const REGEXP = /^(?<id>[a-z]{4}): (?:(?<operand1>[a-z]{4}) (?<operator>[+\-*/]) (?<operand2>[a-z]{4})|(?<value>\d+))$/gm;

// Solve a (op) b = c, where two of the three values are known.
const OPERATIONS = {
  '+': (a, b, c) => {
    if (a === null) {
      return c - b;
    }

    if (b === null) {
      return c - a;
    }

    return a + b;
  },
  '-': (a, b, c) => {
    if (a === null) {
      return c + b;
    }

    if (b === null) {
      return a - c;
    }

    return a - b;
  },
  '*': (a, b, c) => {
    if (a === null) {
      return c / b;
    }

    if (b === null) {
      return c / a;
    }

    return a * b;
  },
  '/': (a, b, c) => {
    if (a === null) {
      return c * b;
    }

    if (b === null) {
      return a / c;
    }

    return a / b;
  },
};

/**
 * # [Advent of Code 2022 Day 21](https://adventofcode.com/2022/day/21)
 *
 * The basic idea here is to convert the input into a syntax tree. For part one, we simply evaluate
 * this tree to get the answer. For part two, we must solve what we can in the tree so that we're
 * left with a single long branch to `humn`, then reverse each operation along that branch to
 * determine the required value for `humn`. See the detailed description of the algorithm in
 * [`day-21.md`](day-21.md).
 *
 * It's important to make sure that when you're reversing a subtraction or division operation that
 * you get the order of the operands correct. When solving `a / b = c`, if `a` is the unknown, you
 * solve it with `a = c * b`, but if `b` is the unknown, the answer is `b = a / c`.
 *
 * The `OPERATIONS` constant is an object to look up a function that can solve any equation that
 * takes the form `a (op) b = c`. The function receives three arguments (`a`, `b`, and `c`), where
 * the one we're solving for is `null`. For example, if we want to solve `4 * b = 24`, we can call
 * `OPERATIONS['*'](4, null, 24)` and it will return `6`. This makes it easier to deal with
 * reversing the operations as we traverse the tree down to `humn`, since we can just feed in the
 * operands in order and the expected answer and get the unknown value.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ part1, part2 ].map(part => part(input));

/**
 * Solve part one.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the answer to part one
 */
const part1 = input => {
  const tree = parse(input);
  const root = tree.get('root');
  root.evaluate();
  return root.value;
};

/**
 * Solve part two.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the answer to part two
 */
const part2 = input => {
  const tree = parse(input);
  const humn = tree.get('humn');
  humn.value = null;
  const root = tree.get('root');
  root.operands.forEach(operand => operand.evaluate());
  const { known, unknown } = findKnownAndUnknown(root);
  unknown.value = known.value;
  solveForHumn(unknown);
  return humn.value;
};

/**
 * Walk down the remaining unsolved branch to solve for `humn`. This function is recursive.
 *
 * @param {Node} node - the `Node` to solve from (initially, the unknown child `Node` of `root`)
 */
const solveForHumn = node => {
  const oppositeFn = OPERATIONS[node.operator];
  const operands = node.operands.map(operand => operand.value);
  const { unknown } = findKnownAndUnknown(node);
  unknown.value = oppositeFn(...operands, node.value);

  if (unknown.id !== 'humn') {
    solveForHumn(unknown);
  }
};

/**
 * Given a `Node` where one operand has a known value and the other is unknown, determine which is
 * which. The returned object has a `known` and an `unknown` property.
 *
 * @param {Node} node - the `Node` to evaluate
 * @returns {Object} - the result
 */
const findKnownAndUnknown = node => ({
  known: node.operands.find(operand => operand.value !== null),
  unknown: node.operands.find(operand => operand.value === null),
});

/**
 * Produce a tree from the input.
 *
 * @param {string} input - the puzzle input
 * @returns {Map<string, Node>} - a `Map` of `Node`s
 */
const parse = input => {
  const nodeMap = match(input, REGEXP, record => new Node(record))
    .reduce((map, node) => {
      map.set(node.id, node);
      return map;
    }, new Map());
  [ ...nodeMap.values() ].forEach(node => {
    if (node.operands) {
      node.operands = node.operands.map(id => nodeMap.get(id));
    }
  });
  return nodeMap;
};

/**
 * A node in the tree. All `Node`s have an `id`, and may or may not have the other properties.
 */
class Node {
  id;
  operator;
  operands;
  value;

  /**
   * Create a new `Node` from the given `RegExp` match.
   *
   * @param {Object} record - the `RegExp` match
   */
  constructor(record) {
    this.id = record.id;

    if (record.value !== undefined) {
      this.value = parseInt(record.value, 10);
    } else {
      this.operator = record.operator;
      this.operands = [ record.operand1, record.operand2 ];
      this.value = null;
    }
  }

  /**
   * Performs a depth-first search for solvable `Node`s (ones where the values of its operands are
   * both known), and solves as many as possible.
   */
  evaluate() {
    if (this.value !== null) {
      return;
    }

    if (this.operator) {
      this.operands.forEach(operand => {
        operand.evaluate();
      })

      if (this.operands.every(operand => operand.value !== null)) {
        this.value = OPERATIONS[this.operator](...this.operands.map(operand => operand.value));
      }
    }
  }
}
