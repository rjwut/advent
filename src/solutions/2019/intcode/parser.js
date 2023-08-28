const DefaultParser = require('../../vm/parser.default');
const IntcodeProgram = require('./program');
const { split } = require('../../util');

const OPERATIONS = [
  { // add
    opcode: 1,
    fn: (vm, args) => {
      const v0 = vm.eval(args, 0);
      const v1 = vm.eval(args, 1);
      const sum = v0 + v1;
      const address = vm.eval(args, 2, true);
      vm.program.write(address, sum);
    },
    argCount: 3,
  },
  {
    // multiply
    opcode: 2,
    fn: (vm, args) => {
      const v0 = vm.eval(args, 0);
      const v1 = vm.eval(args, 1);
      const sum = v0 * v1;
      const address = vm.eval(args, 2, true);
      vm.program.write(address, sum);
    },
    argCount: 3,
  },
  {
    // input
    opcode: 3,
    fn: (vm, args) => {
      const input = vm.readInput();

      if (input === undefined) {
        return;
      }

      const address = vm.eval(args, 0, true);
      vm.program.write(address, input);
    },
    argCount: 1,
  },
  {
    // output
    opcode: 4,
    fn: (vm, args) => {
      const output = vm.eval(args, 0);
      vm.output(output);
    },
    argCount: 1,
  },
  {
    // jump-if-true
    opcode: 5,
    fn: (vm, args) => {
      const value = vm.eval(args, 0);
      const address = vm.eval(args, 1);

      if (value) {
        vm.ip = address;
      }
    },
    argCount: 2,
  },
  {
    // jump-if-false
    opcode: 6,
    fn: (vm, args) => {
      const value = vm.eval(args, 0);
      const address = vm.eval(args, 1);

      if (!value) {
        vm.ip = address;
      }
    },
    argCount: 2,
  },
  {
    // less-than
    opcode: 7,
    fn: (vm, args) => {
      const v0 = vm.eval(args, 0);
      const v1 = vm.eval(args, 1);
      const result = v0 < v1 ? 1 : 0;
      const address = vm.eval(args, 2, true);
      vm.program.write(address, result);
    },
    argCount: 3,
  },
  {
    // equals
    opcode: 8,
    fn: (vm, args) => {
      const v0 = vm.eval(args, 0);
      const v1 = vm.eval(args, 1);
      const result = v0 === v1 ? 1 : 0;
      const address = vm.eval(args, 2, true);
      vm.program.write(address, result);
    },
    argCount: 3,
  },
  {
    // relative-base-offset
    opcode: 9,
    fn: (vm, args) => {
      const v0 = vm.eval(args, 0);
      vm.relativeBase += v0;
    },
    argCount: 1,
  },
  {
    // terminate
    opcode: 99,
    fn: vm => {
      vm.terminate();
    },
    argCount: 0,
  },
];

/**
 * The Intcode parser.
 */
class IntcodeParser extends DefaultParser {
  /**
   * Set up the parser for Intcode operations.
   */
  constructor() {
    super();
    OPERATIONS.forEach(({ opcode, fn, argCount }) => {
      const wrapper = (vm, args) => {
        let ip = vm.ip;
        fn(vm, args);

        if (vm.state === 'running' && opcode !== 99 && ip === vm.ip) {
          vm.ip += argCount + 1;
        }
      };
      wrapper.argCount = argCount;
      this.opcode(opcode, wrapper);
    });
  }

  /**
   * Produce an `IntcodeProgram` for the given Intcode source.
   *
   * @param {string} source - the Intcode source
   * @returns {IntcodeProgram} - the parsed program
   */
  parse(source) {
    return new IntcodeProgram(
      this,
      split(source, {
        delimiter: ',',
        parseInt: true,
      })
    );
  }
}

module.exports = IntcodeParser;
