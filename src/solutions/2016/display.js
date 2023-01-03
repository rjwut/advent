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
 * A class for the display used in Day 8 and the bonus challenge.
 */
class Display {
  #grid;

  constructor(rows, cols) {
    this.#grid = new SimpleGrid({ cols, rows, fill: '.' });
  }

  /**
   * Executes the instructions on this `Display`.
   *
   * @param {string} instructions - the instructions to execute
   */
  execute(instructions) {
    instructions = this.#parse(instructions);
    instructions.forEach(instruction => {
      OPERATIONS[instruction.op](this.#grid, instruction);
    });
  }

  /**
   * @returns {number} - the number of lit pixels
   */
  get litPixels() {
    return this.#grid.count(el => el === '#');
  }

  /**
   * Renders the display.
   *
   * @returns {string} - the display render
   */
  toString() {
    return this.#grid.toString();
  }

  /**
   * Runs charater recognition on the display.
   *
   * @returns {Promise<string>} - resolves to the recognized characters
   */
  async ocr() {
    return ocr(this.#grid.toString());
  }

  /**
   * Parses the string instructions into an array of instruction objects. The objects
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
  #parse(instructions) {
    return match(instructions, INSTRUCTION_REGEXP, record => {
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
  }
}

module.exports = Display;
