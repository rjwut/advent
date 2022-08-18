const SimpleGrid = require('../simple-grid');
const { match } = require('../util');

const REGEXP = /^(?<operation>turn on|turn off|toggle) (?<x0>\d+),(?<y0>\d+) through (?<x1>\d+),(?<y1>\d+)$/gm;

/**
 * Operations dictionaries for each puzzle part
 */
const OPERATIONS = [
  {
    'turn on': () => 1,
    'turn off': () => 0,
    'toggle': on => on ? 0 : 1,
  },
  {
    'turn on': value => value + 1,
    'turn off': value => value ? value - 1 : 0,
    'toggle': value => value + 2,
  },
];

/**
 * # [Advent of Code 2015 Day 6](https://adventofcode.com/2015/day/6)
 *
 * The thing that differs between the two parts is the interpretation of the
 * instructions given in the input. For part one, the grid contains the simple
 * on/off state of each light, while in part two, it contains a brightness
 * value. If we use `0` to represent "off" and `1` to represent "on," the final
 * answer for each part can be obtained by summing the values in the grid. So
 * for each part, we simply build a grid filled with `0`, iterate the
 * instructions and execute them according to the interpretation for that part,
 * then sum the grid values.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const instructions = match(input, REGEXP, {
    x0: Number,
    y0: Number,
    x1: Number,
    y1: Number,
  });
  return OPERATIONS.map(operations => execute(instructions, operations));
};

/**
 * Executes the given instructions and returns the sum of the resulting grid
 * values. Each instruction is an Object with an `operation` property (one of
 * `'turn on'`, `'turn off'`, or `'toggle'`) and coordinate properties for the
 * corners of the rectangle of lights to apply the operation to (`x0`, `y0`,
 * `x1`, `y1`). The `operations` object allows you to look up a function that
 * will perform an operation using its name as the lookup key.
 *
 * @param {Array<Object>} instructions - the instruction objects
 * @param {Object} operations - the operations dictionary to use 
 * @returns 
 */
const execute = (instructions, operations) => {
  const grid = new SimpleGrid({
    cols: 1000,
    rows: 1000,
    fill: 0,
  });
  instructions.forEach(match => {
    const op = operations[match.operation];

    for (let x = match.x0; x <= match.x1; x++) {
      for (let y = match.y0; y <= match.y1; y++) {
        grid.set(y, x, op(grid.get(y, x)));
      }
    }
  });
  return grid.reduce((sum, value) => sum + value, 0);
};
