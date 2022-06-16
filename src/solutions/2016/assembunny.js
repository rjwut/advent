const { split } = require('../util')

const REG_NAMES = new Set([ 'a', 'b', 'c', 'd' ]);

/**
 * The `cpy` operation.
 *
 * Arguments:
 *
 * 0. The value to copy (or the register containing it)
 * 1. The register to copy to (instruction skipped if not a register)
 *
 * @param {Object} ctx - the VM's context
 * @param {Array} args - the instruction arguments
 * @returns {number} - the offset to apply to the instruction pointer
 */
const cpy = (ctx, args) => {
  if (REG_NAMES.has(args[1])) {
    ctx.regs[args[1]] = ctx.valueOf(args[0]);
  }

  return 1;
};

/**
 * The `inc` operation.
 *
 * Arguments:
 *
 * 0. The register to increment (instruction skipped if not a register)
 *
 * @param {Object} ctx - the VM's context
 * @param {Array} args - the instruction arguments
 * @returns {number} - the offset to apply to the instruction pointer
 */
const inc = (ctx, args) => {
  if (REG_NAMES.has(args[0])) {
    ctx.regs[args[0]]++;
  }

  return 1;
};

/**
 * The `dec` operation.
 *
 * Arguments:
 *
 * 0. The register to decrement (instruction skipped if not a register)
 *
 * @param {Object} ctx - the VM's context
 * @param {Array} args - the instruction arguments
 * @returns {number} - the offset to apply to the instruction pointer
 */
const dec = (ctx, args) => {
  if (REG_NAMES.has(args[0])) {
    ctx.regs[args[0]]--;
  }

  return 1;
};

/**
 * The `jnz` operation.
 *
 * Arguments:
 *
 * 0. The value which must be non-zero for a jump to occur (or the register
 *    containing it)
 * 1. The offset to jump by (or the register containing it)
 *
 * @param {Object} ctx - the VM's context
 * @param {Array} args - the instruction arguments
 * @returns {number} - the offset to apply to the instruction pointer
 */
const jnz = (ctx, args) => {
  return ctx.valueOf(args[0]) ? ctx.valueOf(args[1]) : 1;
};

/**
 * The `tgl` operation.
 *
 * Arguments:
 *
 * 0. The offset of the instruction to be toggled (or the register containing
 *    it)
 *
 * @param {Object} ctx - the VM's context
 * @param {Array} args - the instruction arguments
 * @returns {number} - the offset to apply to the instruction pointer
 */
const tgl = (ctx, args) => {
  const index = ctx.pointer + ctx.valueOf(args[0]);
  const instruction = ctx.program[index];

  if (instruction) {
    instruction.op = TOGGLES[instruction.op];
  }

  return 1;
};

/**
 * The `out` operation.
 *
 * Arguments:
 *
 * 0. The value to be output (or the register containing it)
 *
 * @param {Object} ctx - the VM's context
 * @param {Array} args - the instruction arguments
 * @returns {number} - the offset to apply to the instruction pointer
 */
const out = (ctx, args) => {
  ctx.output.push(ctx.valueOf(args[0]));
  return 1;
};

const OPERATIONS = { cpy, inc, dec, jnz, tgl, out };
const TOGGLES = {
  cpy: 'jnz',
  inc: 'dec',
  dec: 'inc',
  jnz: 'cpy',
  tgl: 'inc',
  out: 'inc',
};

/**
 * The Assembunny VM. This function returns an object representing the VM's
 * API:
 *
 * - `ctx` (`Object`): The VM's context:
 *   - `program` (`Array`): The parsed program
 *   - `regs` (`Object`): The VM's registers
 *   - `pointer` (number): The VM's instruction pointer
 *   - `output` (`Array`): An array of any values output by the VM
 *   - `valueOf()`: A function that returns the value stored at the named
 *     register (if the argument is a string), or the argument itself (if it's
 *     not a string)
 * - `patch()`: Replaces a range of instructions with a function
 * - `run()`: Runs the program until it halts
 * - `reset()`: Resets the VM to it initial state
 *
 * @param {string} source - the program source code
 * @returns {Object} - the VM API
 */
module.exports = source => {
  const ctx = {
    program: parse(source),
    /**
     * If the argument is a string, it is presumed to be the name of a
     * register, and this function returns the value stored in that register.
     * Otherwise, it returns the argument itself.
     *
     * @param {*} value - the value to check
     * @returns {number} - the resulting value
     */
    valueOf: value => typeof value === 'string' ? ctx.regs[value] : value,
  };
  const vm = {
    ctx,
    /**
     * Patches the program by replacing a range of instructions with a
     * function. When the instruction pointer reaches the starting instruction
     * in the specified range, the patch function is executed instead, and the
     * instruction pointer is moved to the first instruction after the range.
     *
     * @param {number} start - the index of the first instruction in the range
     * @param {number} length - the number of instructions to replace
     * @param {Function} fn - the function to run instead
     */
    patch: (start, length, fn) => {
      ctx.program[start].patch = () => {
        fn();
        ctx.pointer += length;
      };
    },
    run: breakCondition => run(ctx, breakCondition),
    reset: () => {
      ctx.regs = Object.fromEntries([ ...REG_NAMES ].map(key => [ key, 0 ]));
      ctx.pointer = 0;
      ctx.output = [];
    },
  };
  vm.reset();
  return vm;
};

/**
 * Returns an array of instruction objects representing the parsed program.
 * Each instruction object has the following properties:
 *
 * - `op` (`string`): The operation name
 * - `args` (`Array`): The operation arguments, with numeric values parsed as
 *   numbers
 *
 * @param {string} source - the Assembunny source code
 * @returns {Array} - the parsed program
 */
const parse = source => split(source).map(line => {
  const parts = line.split(' ');
  const args = parts.slice(1).map(arg => REG_NAMES.has(arg) ? arg: parseInt(arg, 10));
  return {
    op: parts[0],
    args,
  };
});

/**
 * Executes the program and updates the VM's context accordingly.
 *
 * @param {Object} ctx - the context object
 * @param {Function} [breakCondition] - a predicate that will cause execution
 * to halt if it ever returns `true`
 */
 const run = (ctx, breakCondition) => {
  do {
    if (breakCondition?.()) {
      break;
    }

    const instruction = ctx.program[ctx.pointer];

    if (instruction.patch) {
      instruction.patch();
    } else {
      ctx.pointer += OPERATIONS[instruction.op](ctx, instruction.args);
    }
  } while (ctx.pointer >= 0 && ctx.pointer < ctx.program.length);
};
