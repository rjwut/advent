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

class DeviceParser extends DefaultParser {
  constructor() {
    super();
    OPERATIONS.forEach((fn, index) => {
      const wrapper = (vm, arg) => {
        let ip = vm.ip;
        fn(vm, arg);

        if (vm.state === 'running' && ip === vm.ip) {
          vm.ip += 2;
        }
      };
      this.opcode(index, wrapper);
    });
  }

  /**
   * Produce an `IntcodeProgram` for the given Intcode source.
   *
   * @param {string} source - the Intcode source
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
