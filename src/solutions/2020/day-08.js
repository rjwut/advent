const Vm = require('../vm');

/**
 * # [Advent of Code 2020 Day 8](https://adventofcode.com/2020/day/8)
 *
 * I loved this one! I originally implemented this from scratch, but I later refactored it to use
 * my new `Vm` class to represent the virtual machine.
 *
 * Both parts of the puzzle require us to detect when we have entered an endless loop. Part two
 * requires us to change one instruction to make it so that the program terminates normally
 * (attempts to execute the non-existent instruction after the last one), so we have to be able to
 * handle both situations when running our program.
 *
 * Since there are no branching instructions and the program is not self-modifying, we can detect
 * an infinite loops simply by keeping a `Set` of the indexes of all the instructions we have
 * encountered. Before executing an instruction, we check the `Set` to see if we've already run
 * this instruction before; if so, we've looped. I implemented this as an event listener on the
 * `Vm`, terminating with an error when we detect an infinite loop. This is enough for part one:
 * just run the code and return the value of the accumulator when it terminates.
 *
 * Part two tells us that changing exactly one `jmp` to `nop` or `nop` to `jmp` will result in the
 * program terminating normally; we have to discover which instruction to change, and return the
 * value of the accumulator when that program terminates. To do this, we can simply iterate the
 * program instructions and look for `jmp` or `nop` instructions. For each one, we clone the
 * program and replace that instruction, then run the program and check to see if it terminated
 * normally. If so, the accumulator value is our answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [
  runAsIs(input),
  fixLoop(input),
];

/**
 * Runs the program without modification, and returns the value in the accumulator when the
 * infinite loop is detected.
 *
 * @param {Array} program - the program instructions
 * @returns {number} - the accumulator value
 */
const runAsIs = program => {
  const vm = new GameBoy();
  vm.load(program);
  vm.run();
  return vm.getRegister('acc');
};

/**
 * Repairs the program as indicated in the puzzle (by replacing a `jmp` with a `nop` or vice-versa)
 * so that it terminates normally, then returns the value of the accumulator.
 *
 * @param {Array} program - the program instructions
 * @returns {number} - the accumulator value
 */
const fixLoop = program => {
  program = program.trim().split('\n');

  for (let i = 0; i < program.length; i++) {
    const instruction = program[i].split(' ');

    if (instruction[0] === 'acc') {
      continue;
    }

    const newOpCode = instruction[0] === 'nop' ? 'jmp' : 'nop';
    const alteredProgram = [ ...program ];
    alteredProgram[i] = `${newOpCode} ${instruction[1]}`;
    const vm = new GameBoy();
    vm.load(alteredProgram.join('\n'));
    vm.run();

    if (!vm.error) {
      return vm.getRegister('acc');
    }
  }
};

class GameBoy extends Vm {
  #seen;

  constructor() {
    super();
    this.declareRegisters('acc');
    this.parser.opcode('acc', (vm, [ arg ]) => {
      this.addRegister('acc', arg);
    });
    this.parser.opcode('jmp', (vm, [ arg ]) => {
      vm.ip += arg;
    });
    this.parser.opcode('nop', () => {});
    this.#seen = new Set();
    this.on('preop', () => {
      if (this.#seen.has(this.ip)) {
        throw new Error('Infinite loop detected');
      }

      this.#seen.add(this.ip);
    });
    this.throwUnheardErrors = false;
  }
}
