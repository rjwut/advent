const Vm = require('../vm');

const COMMON_OPERATIONS = {
  set: (vm, args) => {
    vm.setRegister(args[0], vm.eval(args[1]));
  },
  add: (vm, args) => {
    vm.setRegister(args[0], vm.getRegister(args[0]) + vm.eval(args[1]));
  },
  sub: (vm, args) => {
    vm.setRegister(args[0], vm.getRegister(args[0]) - vm.eval(args[1]));
  },
  mul: (vm, args) => {
    vm.setRegister(args[0], vm.getRegister(args[0]) * vm.eval(args[1]));
  },
  mod: (vm, args) => {
    vm.setRegister(args[0], vm.getRegister(args[0]) % vm.eval(args[1]));
  },
  jgz: (vm, args) => {
    if (vm.eval(args[0]) > 0) {
      vm.ip += vm.eval(args[1]);
    }
  },
  jnz: (vm, args) => {
    if (vm.eval(args[0]) !== 0) {
      vm.ip += vm.eval(args[1]);
    }
  },
};
const OPERATIONS = [
  {
    ...COMMON_OPERATIONS,
    snd: (vm, args) => {
      vm.lastSound = vm.eval(args[0]);
    },
    rcv: (vm, args) => {
      if (vm.eval(args[0]) !== 0) {
        vm.terminate();
      }
    },
  },
  {
    ...COMMON_OPERATIONS,
    snd: (vm, args) => {
      vm.output(vm.eval(args[0]));
    },
    rcv: (vm, args) => {
      const input = vm.readInput();

      if (input !== undefined) {
        vm.setRegister(args[0], input);
      }
    },
  },
];

/**
 * Implementation of the "Duet VM" as described in the puzzle for
 * [Day 18](https://adventofcode.com/2017/day/18) and
 * [Day 23](https://adventofcode.com/2017/day/23). This VM extends the `Vm` class and supports both
 * the "wrong" version described in part one of Day 18 (referred to here as version 0) and the
 * "correct" version in part two (version 1). Since Day 23 makes only additive changes to the Duet
 * language, it falls under version 1. Only the `snd` and `rcv` instructions are different between
 * the two versions; all other instructions are supported by both.
 *
 * ## Version 0
 *
 * - The `snd` instruction stores the value to be read out again by `rcv`.
 * - The `rcv` instruction will transfer the most recent value committed by
 *   `snd` to the output queue, but only if the argument is non-zero. This will
 *   also cause the VM to terminate.
 *
 * ## Version 1
 *
 * - The `snd` instruction pushes the value into the output queue.
 * - The `rcv` instruction takes a value from the input queue and stores it
 *   into the indicated register.
 *
 * @param {string} program - the Duet program to execute
 * @param {number} [version=1] - the version of the Duet VM to use
 * @returns {Object} - the Duet VM API
 */
class DuetVm extends Vm {
  lastSound;

  /**
   * Creates a new `DuetVm`.
   *
   * @param {number} [version=1] - whether you want version 0 or version 1 of the instruction set
   */
  constructor(version = 1) {
    super();
    Object.entries({
      ...COMMON_OPERATIONS,
      ...OPERATIONS[version],
    }).forEach(([ opcode, fn ]) => {
      this.parser.opcode(opcode, fn);
    });
  }
}

module.exports = DuetVm;
