const { split } = require('../util');

/**
 * The 16 operations supported by your wrist device.
 */
const operations = {
  addr: {
    id: 'addr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] + regs[args[1]];
    },
  },
  addi: {
    id: 'addi',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] + args[1];
    },
  },
  mulr: {
    id: 'mulr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] * regs[args[1]];
    },
  },
  muli: {
    id: 'muli',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] * args[1];
    },
  },
  banr: {
    id: 'banr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] & regs[args[1]];
    },
  },
  bani: {
    id: 'bani',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] & args[1];
    },
  },
  borr: {
    id: 'borr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] | regs[args[1]];
    },
  },
  bori: {
    id: 'bori',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] | args[1];
    },
  },
  setr: {
    id: 'setr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]];
    },
  },
  seti: {
    id: 'seti',
    fn: (regs, args) => {
      regs[args[2]] = args[0];
    },
  },
  gtir: {
    id: 'gtir',
    fn: (regs, args) => {
      regs[args[2]] = args[0] > regs[args[1]] ? 1 : 0;
    },
  },
  gtri: {
    id: 'gtri',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] > args[1] ? 1 : 0;
    },
  },
  gtrr: {
    id: 'gtrr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] > regs[args[1]] ? 1 : 0;
    },
  },
  eqir: {
    id: 'eqir',
    fn: (regs, args) => {
      regs[args[2]] = args[0] === regs[args[1]] ? 1 : 0;
    },
  },
  eqri: {
    id: 'eqri',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] === args[1] ? 1 : 0;
    },
  },
  eqrr: {
    id: 'eqrr',
    fn: (regs, args) => {
      regs[args[2]] = regs[args[0]] === regs[args[1]] ? 1 : 0;
    },
  },
};

/**
 * Parses the input Elfcode program into an array of instruction objects. Each
 * object has the following properties:
 *
 * - `op` (string): The operation name
 * - `args` (Array): The arguments for the operation
 *
 * @param {string} input - the input Elfcode program
 * @returns {Array} - the parsed program
 */
const parse = input => split(input).map(line => {
  const parts = line.split(' ');
  return {
    op: parts[0],
    args: parts.slice(1).map(Number),
  };
});

/**
 * Builds the virtual machine to run the program. The VM has the following API:
 *
 * - `terminated` (boolean): Whether the program has terminated
 * - `regs` (Array): The registers
 * - `ipReg` (number): The index of the register that is bound to the instruction
 *   pointer
 * - `step()`: Executes the next instruction
 *
 * @param {Array} program - the program to execute
 * @returns {Object} - the VM API
 */
const buildVm = program => {
  const regs = [ 0, 0, 0, 0, 0, 0 ];
  const ipReg = program[0].args[0];
  program = program.slice(1);
  const api = {
    terminated: false,
    regs,
    ipReg,
    step: () => {
      if (regs[ipReg] < 0 || regs[ipReg] >= program.length) {
        api.terminated = true;
        return;
      }

      const { op, args } = program[regs[ipReg]];
      const operation = operations[op];
      operation.fn(regs, args);
      regs[ipReg]++;
    },
  };
  return api;
};

/**
 * VM implementation for the wrist computer used days 16, 19, and 21.
 */
module.exports = {
  operations,
  parse,
  buildVm,
}