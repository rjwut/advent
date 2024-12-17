const Vm = require('../vm');
const DeviceParser = require('./day-17.parser');

const COMBO_OPERANDS = [
  () => 0n,
  () => 1n,
  () => 2n,
  () => 3n,
  vm => vm.getRegister('A'),
  vm => vm.getRegister('B'),
  vm => vm.getRegister('C'),
  () => {
    throw new Error('Invalid combo operand');
  },
];

class Device extends Vm {
  constructor() {
    super({
      bigint: true,
      ipIncrement: 'never',
      parser: new DeviceParser(),
      registerNames: [ 'A', 'B', 'C' ],
    });
  }

  combo(arg) {
    return COMBO_OPERANDS[arg](this);
  }
}

module.exports = Device;
