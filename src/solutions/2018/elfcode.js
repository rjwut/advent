const Vm = require('../vm');

/**
 * The 16 operations supported by your wrist device.
 */
const OPERATIONS = [
  {
    id: 'addr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) + vm.getRegister(args[1]));
    },
  },
  {
    id: 'addi',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) + args[1]);
    },
  },
  {
    id: 'mulr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) * vm.getRegister(args[1]));
    },
  },
  {
    id: 'muli',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) * args[1]);
    },
  },
  {
    id: 'banr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) & vm.getRegister(args[1]));
    },
  },
  {
    id: 'bani',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) & args[1]);
    },
  },
  {
    id: 'borr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) | vm.getRegister(args[1]));
    },
  },
  {
    id: 'bori',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) | args[1]);
    },
  },
  {
    id: 'setr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]));
    },
  },
  {
    id: 'seti',
    fn: (vm, args) => {
      vm.setRegister(args[2], args[0]);
    },
  },
  {
    id: 'gtir',
    fn: (vm, args) => {
      vm.setRegister(args[2], args[0] > vm.getRegister(args[1]) ? 1 : 0);
    },
  },
  {
    id: 'gtri',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) > args[1] ? 1 : 0);
    },
  },
  {
    id: 'gtrr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) > vm.getRegister(args[1]) ? 1 : 0);
    },
  },
  {
    id: 'eqir',
    fn: (vm, args) => {
      vm.setRegister(args[2], args[0] === vm.getRegister(args[1]) ? 1 : 0);
    },
  },
  {
    id: 'eqri',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) === args[1] ? 1 : 0);
    },
  },
  {
    id: 'eqrr',
    fn: (vm, args) => {
      vm.setRegister(args[2], vm.getRegister(args[0]) === vm.getRegister(args[1]) ? 1 : 0);
    },
  },
];
OPERATIONS.forEach(op => Object.freeze(op));
Object.freeze(OPERATIONS);

/**
 * The Elfcode VM that runs on your wrist device.
 */
class ElfcodeVm extends Vm {
  #ipBind;

  /**
   * Create a new `ElfcodeVm`.
   */
  constructor() {
    super();
    this.declareRegisters(0, 1, 2, 3, 4, 5);
    OPERATIONS.forEach(({ id, fn }) => {
      this.parser.opcode(id, fn);
    });
    this.#ipBind = null;
    this.on('prestep', () => {
      // Do not modify the IP bound register if we're already going to terminate
      if (this.ip < 0 || this.ip >= this.program.length) {
        return;
      }

      if (this.#ipBind !== null) {
        this.setRegister(this.#ipBind, this.ip);
      }
    });
    this.on('postop', () => {
      if (this.#ipBind !== null) {
        this.ip = this.getRegister(this.#ipBind);
      }
    });
    this.ipIncrement = 'always';
  }

  /**
   * Loads the source code into the VM. Overridden in order to handle a preprocessing directive
   * that might appear on the first line.
   *
   * @param {string} source - the program source
   */
  load(source) {
    // First line might be a preprocessing directive to bind the IP to a register
    if (source.startsWith('#ip ')) {
      const newlineIndex = source.indexOf('\n');
      this.#ipBind = parseInt(source.substring(4, newlineIndex), 10);
      source = source.substring(newlineIndex + 1);
    } else {
      this.#ipBind = null;
    }

    super.load(source);
  }
}

ElfcodeVm.OPERATIONS = OPERATIONS;
module.exports = ElfcodeVm;
