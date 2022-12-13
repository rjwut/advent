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
      vm.trace(`  ADD ${v0} + ${v1} = ${sum} -> ${address}`);
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
      vm.trace(`  MULTIPLY ${v0} * ${v1} = ${sum} -> ${address}`);
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
        vm.trace('  BLOCKED ON INPUT');
        return;
      }

      const address = vm.eval(args, 0, true);
      vm.trace(`  INPUT ${input} -> ${address}`);
      vm.program.write(address, input);
    },
    argCount: 1,
  },
  {
    // output
    opcode: 4,
    fn: (vm, args) => {
      const output = vm.eval(args, 0);
      vm.trace(`  OUTPUT ${output}`);
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
      vm.trace(`  JUMP-IF-TRUE ${value} -> ${address}`);

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
      vm.trace(`  JUMP-IF-FALSE ${value} -> ${address}`);

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
      vm.trace(`  LESS-THAN ${v0} < ${v1}: ${result} -> ${address}`);
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
      vm.trace(`  EQUALS ${v0} < ${v1}: ${result} -> ${address}`);
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
      vm.trace(`  RELATIVE-BASE-OFFSET ${v0} -> ${vm.relativeBase}`);
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
