const Vm = require('../vm');
const ocr = require('../ocr');

const ADDX_REGEXP = /addx /g;
const SCREEN_ROWS = 6;
const SCREEN_COLS = 40;

const OPERATIONS = [
  {
    opcode: 'addx',
    fn: (vm, args) => {
      vm.addRegister('x', args[0]);
    },
  },
  {
    opcode: 'noop',
    fn:() => {},
  },
];

/**
 * # [Advent of Code 2022 Day 10](https://adventofcode.com/2022/day/10)
 *
 * A realization which simplified things was to recognize that if I inserted a `noop` in front of
 * each `addx`, the instruction pointer's value equals the number of cycles. This solution
 * leverages my `Vm` class to do a lot of the work for me.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async input => {
  const vm = buildVm(input);
  return [ part1(vm), await part2(vm) ];
};

/**
 * Creates a `Vm` and loads the input.
 *
 * @param {*} input
 */
const buildVm = input => {
  input = input.replaceAll(ADDX_REGEXP, 'noop\naddx ');
  const vm = new Vm({
    registerNames: [ 'x' ],
  });
  OPERATIONS.forEach(({ opcode, fn }) => {
    vm.parser.opcode(opcode, fn);
  });
  vm.load(input);
  return vm;
};

/**
 * Solve part one using the loaded `Vm`.
 *
 * @param {Vm} vm - the `Vm`
 * @returns {number} - the answer to part one
 */
const part1 = vm => {
  vm.setRegister('x', 1);
  let signalSum = 0;
  let nextInterestingCycle = 19;
  vm.on('poststep', () => {
    if (vm.ip === nextInterestingCycle) {
      // Act only on the interesting cycles.
      signalSum += (vm.ip + 1) * vm.getRegister('x');
      nextInterestingCycle += 40;
    }
  });
  vm.run();
  return signalSum;
};

/**
 * Solve part two using the loaded `Vm`.
 *
 * @param {Vm} vm - the `Vm`
 * @returns {number} - the answer to part two
 */
const part2 = async vm => {
  vm.reset();
  vm.setRegister('x', 1);
  const display = new Array(SCREEN_ROWS * SCREEN_COLS);
  vm.on('prestep', () => {
    // Draw a pixel before each instruction is executed.
    const ip = vm.ip;
    const xDraw = ip % SCREEN_COLS;
    const xSprite = vm.getRegister('x');
    display[ip] = Math.abs(xDraw - xSprite) < 2 ? '#' : '.';
  });
  vm.run();

  // Build the image string from the pixel array and OCR it.
  const rows = new Array(SCREEN_ROWS);

  for (let i = 0; i < SCREEN_ROWS; i++) {
    const pos = i * SCREEN_COLS;
    rows[i] = display.slice(pos, pos + SCREEN_COLS).join('');
  }

  const image = rows.join('\n');
  return ocr(image);
};
