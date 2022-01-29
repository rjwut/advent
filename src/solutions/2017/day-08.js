const { match } = require('../util');

const INSTRUCTION_REGEXP = /^(?<regToChange>\w+) (?<direction>(?:in|de)c) (?<amount>-?\d+) if (?<regToCheck>\w+) (?<operator>\S+) (?<value>-?\d+)$/gm;
const OPERATORS = {
  '<':  (a, b) => a < b,
  '>':  (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
};
const ACTIONS = {
  inc: (a, b) => a + b,
  dec: (a, b) => a - b,
};

/**
 * # [Advent of Code 2017 Day 8](https://adventofcode.com/2017/day/8)
 *
 * This one wasn't very hard; the most complex part is parsing the input, which
 * I did with a regular expression. I wrote functions to implement each of the
 * six operators, and two more to implement the `inc` and `dec` actions.
 * Register values are stored in a `Map`, and if I look up a key that doesn't
 * exist, I just provide `0` as the value.
 *
 * Then I just iterated the parsed instructions, and used the functions I wrote
 * to perform the condition check and, if it passes, the action. If a register
 * value is changed, I check to see if it's larger than the largest value we've
 * seen so far; if so, I update the largest value.
 *
 * Once all instructions have been processed, part one is just the largest
 * value stored in the `Map`, while part two is the largest value ever seen,
 * which we've already computed.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const instructions = match(input, INSTRUCTION_REGEXP, {
    amount: Number,
    value: Number,
  });
  const regs = new Map();
  let highestEver = 0;
  instructions.forEach(instruction => {
    const { regToChange, direction, amount, regToCheck, operator, value } = instruction;
    const regValue = regs.get(regToCheck) ?? 0;

    if (OPERATORS[operator](regValue, value)) {
      const newValue = ACTIONS[direction](regs.get(regToChange) ?? 0, amount);
      highestEver = Math.max(newValue, highestEver);
      regs.set(regToChange, newValue);
    }
  });

  return [ Math.max(...regs.values()), highestEver ];
};
