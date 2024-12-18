const { split } = require('../util');
const DefaultParser = require('../vm/parser.default');
const DeviceProgram = require('./day-17.program');

const OPERATIONS = [
  (vm, arg) => { // adv
    vm.setRegister('A', vm.getRegister('A') >> vm.combo(arg));
  },
  (vm, arg) => { // bxl
    vm.setRegister('B', vm.getRegister('B') ^ arg);
  },
  (vm, arg) => { // bst
    vm.setRegister('B', vm.combo(arg) & 7n);
  },
  (vm, arg) => { // jnz
    if (vm.getRegister('A') !== 0n) {
      vm.ip = Number(arg);
    }
  },
  vm => { // bxc
    vm.setRegister('B', vm.getRegister('B') ^ vm.getRegister('C'));
  },
  (vm, arg) => { // out
    vm.output(vm.combo(arg) & 7n);
  },
  (vm, arg) => { // bdv
    vm.setRegister('B', vm.getRegister('A') >> vm.combo(arg));
  },
  (vm, arg) => { // cdv
    vm.setRegister('C', vm.getRegister('A') >> vm.combo(arg));
  },
];

/**
 * `Parser` implementation for the handheld device for Day 17.
 */
class DeviceParser extends DefaultParser {
  constructor() {
    super();
    // Register the supported operations
    OPERATIONS.forEach((fn, index) => {
      const wrapper = (vm, arg) => {
        let ip = vm.ip;
        fn(vm, arg);

        // If the program is still running and the instruction pointer hasn't been changed by the
        // operation (not `jnz`), increment it by 2.
        if (vm.state === 'running' && ip === vm.ip) {
          vm.ip += 2;
        }
      };
      this.opcode(index, wrapper);
    });
  }

  /**
   * Produce a `DeviceProgram` for the given source code
   *
   * @param {string} source - the source code
   * @returns {DeviceProgram} - the parsed program
   */
  parse(source) {
    return new DeviceProgram(
      this,
      split(source, {
        delimiter: ',',
        parseInt: true,
      })
    );
  }
}

module.exports = DeviceParser;
