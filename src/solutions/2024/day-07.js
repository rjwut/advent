const { split } = require('../util');

const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const concatenate = (a, b) => Number(`${a}${b}`);
const OPERATIONS = [
  [ add, multiply ],
  [ add, multiply, concatenate ],
];

/**
 * # [Advent of Code 2024 Day 7](https://adventofcode.com/2024/day/7)
 *
 * Parsing the input was pretty straightforward: split lines, split on `': '`, split the operands on
 * whitespace, and parse all as numbers. The thing that differed between the two parts is the list
 * of possible operations, so I created two arrays containing the operations that were possible for
 * each part of the puzzle. I wrote a `canBeTrue()` function that accepted the equation to test and
 * the array of possible operations, then did a depth-first search for a combination of operations
 * that produce the correct answer. Here's an example of the search space for the second equation in
 * the test case given by the puzzle for part 1:
 *
 * ```txt
 * 81 ───┬───┤+├─── 40 ───┬───┤+├─── 27 => 81 + 40 + 27 = 148
 *       │                │
 *       │                └───┤*├─── 27 => 81 + 40 * 27 = 3267
 *       │
 *       └───┤*├─── 40 ───┬───┤+├─── 27 => 81 * 40 + 27 = 3267
 *                        │
 *                        └───┤*├─── 27 => 81 * 40 * 27 = 87480
 * ```
 *
 * The search performs three loops before finding that the equation could be correct. (If I had
 * chosen a breadth-first search, have taken four, since it wouldn't start investigating leaf nodes
 * in the search tree until all branches leading up to them had been traversed.)
 *
 * The answers for all equations found to be possibly true are summed to produce the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const equations = parse(input);
  return OPERATIONS.map(
    possibleOperations => equations
      .filter(equation => canBeTrue(equation, possibleOperations))
      .reduce((sum, { answer }) => sum + answer, 0)
  );
};

/**
 * Parse the input into an array of equations. Each equation object has two properties:
 *
 * - `operands: number[]`
 * - `answer: number`
 *
 * @param {string} input - the puzzle input
 * @returns {Object[]} - an array of equation objects
 */
const parse = input => split(input)
  .map(line => {
    const [ answer, operands ] = line.split(': ');
    return {
      operands: operands.split(' ').map(Number),
      answer: Number(answer),
    };
  });

/**
 * Determines whether it is possible for the given equation to be true with any combination of the
 * given operations.
 *
 * @param {Object} equation - the equation to test
 * @param {number[]} equation.operands - the equation's operands
 * @param {number} equation.answer - the desired answer for the equation
 * @param {Function[]} possibleOperations - the possible operations to plug into the equation
 * @returns {boolean} - `true` if any combination of the given operations can produce the answer;
 * `false` otherwise
 */
const canBeTrue = ({ operands, answer }, possibleOperations) => {
  const stack = [ [] ];

  do {
    const operations = stack.pop();

    for (const operation of possibleOperations) {
      const nextOperations = [ ...operations, operation ];

      if (nextOperations.length === operands.length - 1) {
        const testAnswer = evaluate(operands, nextOperations);

        if (testAnswer === answer) {
          return true;
        }
      } else {
        stack.push(nextOperations);
      }
    }
  } while (stack.length);

  return false;
};

/**
 * Applies the given operations to the indicated operands and returns the answer. Note that there
 * must be one fewer operation than there are operands.
 *
 * @param {number[]} operands - the equation's operands
 * @param {Function[]} operations - the operations to apply to the operands
 * @returns {number} - the answer
 */
const evaluate = (operands, operations) => {
  let answer = operands[0];

  for (let i = 0; i < operations.length; i++) {
    answer = operations[i](answer, operands[i + 1]);
  }

  return answer;
}