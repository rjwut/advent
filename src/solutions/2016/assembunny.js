const Vm = require('../vm');

const OPERATIONS = [
  {
    opcode: 'cpy',
    fn: (vm, [ from, to ]) => {
      if (vm.hasRegister(to)) {
        vm.setRegister(to, vm.eval(from));
      }
    },
  },
  {
    opcode: 'inc',
    fn: (vm, [ reg ]) => {
      if (vm.hasRegister(reg)) {
        vm.addRegister(reg, 1);
      }
    },
  },
  {
    opcode: 'dec',
    fn: (vm, [ reg ]) => {
      if (vm.hasRegister(reg)) {
        vm.addRegister(reg, -1);
      }
    },
  },
  {
    opcode: 'jnz',
    fn: (vm, [ val, offset ]) => {
      if (vm.eval(val)) {
        vm.ip += vm.eval(offset);
      }
    },
  },
  {
    opcode: 'tgl',
    fn: (vm, [ offset ]) => {
      const targetAddress = vm.ip + vm.eval(offset);

      if (targetAddress < 0 || targetAddress >= vm.program.length) {
        return;
      }

      const instruction = vm.program.get(targetAddress);
      instruction.opcode = TOGGLES[instruction.opcode];
      instruction.fn = vm.parser.getOperation(instruction.opcode);
    },
  },
  {
    opcode: 'out',
    fn: (vm, [ val ]) => {
      vm.output(vm.eval(val));
    },
  },
];

const TOGGLES = {
  cpy: 'jnz',
  inc: 'dec',
  dec: 'inc',
  jnz: 'cpy',
  tgl: 'inc',
  out: 'inc',
};

/**
 * The Assembunny VM used in various puzzles in 2016.
 */
class AssembunnyVm extends Vm {
  /**
   * Creates a new `AssembunnyVm`, with the registers and operations already set up.
   */
  constructor() {
    super();
    this.declareRegisters('a', 'b', 'c', 'd');
    OPERATIONS.forEach(({ opcode, fn }) => {
      this.parser.opcode(opcode, fn);
    });
  }
}

module.exports = AssembunnyVm;
