const { split } = require('../util');

/**
 * # [Advent of Code 2015 Day 23](https://adventofcode.com/2015/day/23)
 *
 * This one was surprisingly easy after the last few. The only tricky bit is
 * that after reading about the `jie` (jump-if-even) instruction, you might
 * skip reading about `jio`, assuming it to mean jump-if-odd, when it's
 * actually jump-if-one.
 *
 * The `Vm` constructor simply parses the input into an array of instruction
 * objects, each of which has an `op` property that contains the name of the
 * operation to be performed, and an `args` property which is the array of
 * arguments, with coerced numeric arguments as needed. The class contains
 * fields for the parsed program array, registers, and instruction pointer. On
 * calling `run()`, it simply loops as follows:
 *
 * 1. Retrieve instruction object at pointer.
 * 2. Look up operation from the `op` property.
 * 3. Executes the operation function, passing in the `Vm` reference and the
 *    `args` property from the instruction object.
 * 4. Loop while instruction pointer is still inside the program.
 *
 * The six operations are represented by functions which accept the `Vm`
 * reference and arguments array and actually performs the operation. This is
 * performed by calling `get()`, `set()`, and `movePointer()` as needed on the
 * `Vm`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solve = input => {
  const vm = new Vm(input);
  return [ 0, 1 ].map(a => {
    vm.reset();
    vm.set('a', a);
    vm.run();
    return vm.get('b');
  });
};

const OPERATIONS = {
  /**
   * Halves the named register value.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to modify
   */
  hlf: (vm, [ r ]) => {
    vm.set(r, Math.floor(vm.get(r) / 2));
    vm.movePointer(1);
  },

  /**
   * Triples the named register value.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to modify
   */
  tpl: (vm, [ r ]) => {
    vm.set(r, vm.get(r) * 3);
    vm.movePointer(1);
  },

  /**
   * Increments the named register value.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to modify
   */
  inc: (vm, [ r ]) => {
    vm.set(r, vm.get(r) + 1);
    vm.movePointer(1);
  },

  /**
   * Moves the instruction pointer by the given number of places.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the pointer offset
   */
  jmp: (vm, [ offset ]) => {
    if (typeof offset === 'string') {
      offset = vm.get(offset);
    }

    vm.movePointer(offset);
  },

  /**
   * Jumps the instruction pointer if the named register value is even.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to check and the pointer offset
   */
  jie: (vm, [ r, offset ]) => {
    if (vm.get(r) % 2 === 0) {
      OPERATIONS.jmp(vm, [ offset ]);
    } else {
      vm.movePointer(1);
    }
  },

  /**
   * Jumps the instruction pointer if the named register value is `1`.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to check and the pointer offset
   */
  jio: (vm, [ r, offset ]) => {
    if (vm.get(r) === 1) {
      OPERATIONS.jmp(vm, [ offset ]);
    } else {
      vm.movePointer(1);
    }
  },
};

/**
 * The virtual machine that solves the puzzle.
 */
class Vm {
  #program;
  #registers;
  #pointer;

  /**
   * Create a new `Vm`.
   *
   * @param {string} source - the puzzle input (the program source)
   */
  constructor(source) {
    this.#program = split(source).map(parseLine);
    this.reset();
  }

  /**
   * Retrieves the value of the named register.
   *
   * @param {string} r - the register
   * @returns {number} - the value
   */
  get(r) {
    return this.#registers[r];
  }

  /**
   * Sets the value of the named register.
   *
   * @param {string} r - the register
   * @param {number} value - the value to set
   */
  set(r, value) {
    this.#registers[r] = value;
  }

  /**
   * Moves the instruction pointer by the given offset.
   *
   * @param {number} offset - the pointer offset
   */
  movePointer(offset) {
    this.#pointer += offset;
  }

  /**
   * Executes the program.
   */
  run() {
    this.#pointer = 0;

    while (this.#pointer >= 0 && this.#pointer < this.#program.length) {
      const instruction = this.#program[this.#pointer];
      OPERATIONS[instruction.op](this, instruction.args);
    }
  }

  /**
   * Sets the registers back to `0`.
   */
  reset() {
    this.#registers = { a: 0, b: 0 };
  }
}

/**
 * Parses a single line from the puzzle input into an instruction object.
 *
 * @param {string} line - the line to parse
 * @returns {Object} - the instruction object
 */
const parseLine = line => {
  const spacePos = line.indexOf(' ');
  const op = line.substring(0, spacePos);
  const args = line.substring(spacePos + 1)
    .split(',')
    .map(arg => {
      arg = arg.trim();

      if (arg.startsWith('+') || arg.startsWith('-')) {
        return parseInt(arg, 10);
      }

      return arg;
    });
  return { op, args };
};

module.exports = solve;
solve.Vm = Vm;
