const { match } = require('../util');
const SimpleGrid = require('../simple-grid');
const ocr = require('../ocr');

const INSTRUCTION_REGEXP = /^(?<op>rect|rotate column|rotate row) (?:[xy]=)?(?<arg1>\d+)(?:x| by )(?<arg2>\d+)$/gm;

const OPERATIONS = {
  'rect': (grid, instruction) => {
    grid.fill(0, 0, instruction.width, instruction.height, '#');
  },
  'rotate column': (grid, instruction) => {
    grid.shiftColumn(instruction.column, instruction.amount);
  },
  'rotate row': (grid, instruction) => {
    grid.shiftRow(instruction.row, instruction.amount);
  },
};

/**
 * # [Advent of Code 2016 Day 8](https://adventofcode.com/2016/day/8)
 *
 * I parsed the input with a regular expression and converted it to an array of
 * instruction objects. The existing `SimpleGrid` class provides the
 * implementation of the screen, with some new methods:
 *
 * - `fill()`: Fill a rectangular region of the grid with a character.
 * - `count()`: Count the number of occurrences of a value in the grid.
 * - `shiftRow()` and `shiftColumn()`: Performs the "rotation" operation ad
 *   described in the puzzle.
 *
 * Then it's simply a matter of invoking the corresponding `SimpleGrid` method
 * for each operation, counting up the lit pixels for part one, and feeding the
 * string render of the grid to my `ocr` module for part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = async input => {
  const grid = execute(input);
  return [
    grid.count(el => el === '#'),
    await ocr(grid.toString()),
  ];
};

/**
 * Executes the instructions in the given `input` string on a `SimpleGrid`.
 *
 * @param {string} input - the puzzle input (the instructions)
 * @param {number} [rows=6] - the number of grid rows
 * @param {number} [cols=50] - the number of grid columns
 * @returns {SimpleGrid} - the grid with the instructions applied
 */
const execute = (input, rows = 6, cols = 50) => {
  const instructions = parse(input);
  const grid = new SimpleGrid({ cols, rows, fill: '.' });
  instructions.forEach(instruction => {
    OPERATIONS[instruction.op](grid, instruction);
  });
  return grid;
}

/**
 * Parses the instructions into an array of instruction objects. The objects
 * have the following properties:
 *
 * - `op` (string): the name of the operation
 * - `width` and `height` (number, `rect` only): the dimensions of the region
 *    to fill
 * - `column` or `row` (number, `rotate row` and `rotate column` only): The
 *   column or row to rotate
 * - `amount` (number, `rotate row` and `rotate column` only): The number of
 *   spaces to rotate the column or row
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed instructions
 */
const parse = input => match(input, INSTRUCTION_REGEXP, record => {
  const obj = {
    op: record.op,
  };
  const arg1 = parseInt(record.arg1, 10);
  const arg2 = parseInt(record.arg2, 10);

  if (obj.op === 'rect') {
    obj.width = arg1;
    obj.height = arg2;
  } else {
    obj.amount = arg2;
    obj[obj.op.split(' ')[1]] = arg1;
  }

  return obj;
});

solver.execute = execute;
module.exports = solver;
