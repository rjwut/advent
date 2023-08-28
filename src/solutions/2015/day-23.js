const Vm = require('../vm');

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
  const vm = new Vm();
  vm.declareRegisters('a', 'b');
  Object.entries(OPERATIONS).forEach(([ opcode, fn ]) => {
    vm.parser.opcode(opcode, fn);
  });
  vm.parser.argSeparator = ', ';
  vm.load(input);
  return [ 0, 1 ].map(a => {
    vm.reset();
    vm.setRegister('a', a);
    vm.run();
    return vm.getRegister('b');
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
    vm.setRegister(r, Math.floor(vm.getRegister(r) / 2));
  },

  /**
   * Triples the named register value.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to modify
   */
  tpl: (vm, [ r ]) => {
    vm.setRegister(r, vm.getRegister(r) * 3);
  },

  /**
   * Increments the named register value.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to modify
   */
  inc: (vm, [ r ]) => {
    vm.addRegister(r, 1);
  },

  /**
   * Moves the instruction pointer by the given number of places.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the pointer offset
   */
  jmp: (vm, [ offset ]) => {
    vm.ip += vm.eval(offset);
  },

  /**
   * Jumps the instruction pointer if the named register value is even.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to check and the pointer offset
   */
  jie: (vm, [ r, offset ]) => {
    if (vm.eval(r) % 2 === 0) {
      OPERATIONS.jmp(vm, [ offset ]);
    }
  },

  /**
   * Jumps the instruction pointer if the named register value is `1`.
   *
   * @param {Vm} vm - the `Vm` instance
   * @param {Array} args - the register to check and the pointer offset
   */
  jio: (vm, [ r, offset ]) => {
    if (vm.eval(r) === 1) {
      OPERATIONS.jmp(vm, [ offset ]);
    }
  },
};

module.exports = solve;
solve.Vm = Vm;
