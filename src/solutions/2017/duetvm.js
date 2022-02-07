const { split } = require('../util');

const COMMON_OPERATIONS = {
  set: (ctx, args) => {
    ctx.setReg(args[0], args[1]);
  },
  add: (ctx, args) => {
    ctx.setReg(args[0], ctx.getReg(args[0]) + ctx.evaluate(args[1]));
  },
  mul: (ctx, args) => {
    ctx.setReg(args[0], ctx.getReg(args[0]) * ctx.evaluate(args[1]));
  },
  mod: (ctx, args) => {
    ctx.setReg(args[0], ctx.getReg(args[0]) % ctx.evaluate(args[1]));
  },
  jgz: (ctx, args) => {
    if (ctx.evaluate(args[0]) > 0) {
      ctx.ip += ctx.evaluate(args[1]) - 1;
    }
  },
};
const OPERATIONS = [
  {
    ...COMMON_OPERATIONS,
    snd: (ctx, args) => {
      ctx.input.push(ctx.evaluate(args[0]));
    },
    rcv: (ctx, args) => {
      if (ctx.evaluate(args[0]) !== 0) {
        ctx.output.push(ctx.input.pop());
      }
    },
  },
  {
    ...COMMON_OPERATIONS,
    snd: (ctx, args) => {
      ctx.output.push(ctx.evaluate(args[0]));
    },
    rcv: (ctx, args) => {
      if (ctx.input.length > 0) {
        ctx.setReg(args[0], ctx.input.shift());
      } else {
        ctx.state = 'blocked';
      }
    },
  },
];

/**
 * Implementation of the "Duet VM" as described in the puzzle for
 * [Day 18](https://adventofcode.com/2017/day/18). This VM supports both the
 * "wrong" version described in part one (referred to here as version 0) and
 * the "correct" version in part two (version 1):
 *
 * ## Version 0
 *
 * - The `snd` instruction pushes the value into the input queue, to be read
 *   out again by `rcv`.
 * - The `rcv` instruction will transfer the most recent value committed by
 *   `snd` to the output queue, but only if the argument is non-zero. This will
 *   also cause the VM to terminate.
 *
 * ## Version 1
 *
 * - The `snd` instruction pushes the value into the output queue.
 * - The `rcv` instruction takes a value from the input queue and stores it
 *   into the indicated register. If the input queue is empty, the VM stops
 *   with its `state` set to `'blocked'`. You can unblock the VM by invoking
 *   `input()`.
 *
 * The returned object exposes the following API:
 *
 * - `input(number)`: Enqueues the given value onto the input queue. This will
 *   unblock the VM if it's currently blocked, meaning that you can call
 *   `run()` and the VM will continue running. Throws an `Error` if the VM is
 *   terminated.
 * - `run()`: Runs the VM until it gets blocked on input or terminated. Throws
 *    an `Error` if the VM is already blocked or terminated.
 * - `flushOutput(): Array`: Returns the contents of the output queue. This
 *   also clears the output queue.
 * - `getReg(string): number`: Returns the value of the given register.
 * - `setReg(string, number)`: Sets the value of the given register.
 * - `getState(): string`: Returns the current state of the VM:
 *   - `'ready'`: The VM is ready to run.
 *   - `'blocked'`: The VM is blocked on input. Invoking `run()` without first
 *     calling `input()` will throw an `Error`.
 *   - `'terminated'`: The VM has terminated. Invoking `input()` or `run()`
 *     will throw an `Error`.
 *
 * @param {string} program - the Duet program to execute
 * @param {number} [version=1] - the version of the Duet VM to use 
 * @returns {Object} - the Duet VM API
 */
module.exports = (program, version = 1) => {
  program = parse(program);
  const operations = OPERATIONS[version];
  const regs = {};

  /**
   * Gets the value of the named register.
   *
   * @param {string} reg - the name of the register
   * @returns {number} - the register's value
   */
  const getReg = reg => regs[reg] ?? 0;

  /**
   * If the given value is a string, the value stored in the register with that
   * name is returned. Otherwise, the given value is returned.
   *
   * @param {*} value - the value to evaluate
   * @returns {number} - the evaluation result
   */
  const evaluate = value => typeof value === 'string' ? getReg(value) : value;

  /**
   * Stores a value in the named register.
   *
   * @param {string} reg - the name of the register
   * @param {number} value - the value to store
   */
  const setReg = (reg, value) => {
    regs[reg] = evaluate(value);
  };

  // This context object is passed to the operations
  const ctx = {
    ip: 0,
    getReg,
    setReg,
    evaluate,
    input: [],
    output: [],
    state: 'ready',
  };

  /**
   * Pushes a value onto the input queue.
   *
   * @param {number} value - the input value
   */
  const input = value => {
    if (ctx.state === 'terminated') {
      throw new Error('Can\'t input on terminated VM');
    }

    ctx.input.push(value);
    ctx.state = 'ready';
  };

  /**
   * Runs the VM until it blocks on input or terminates. It will terminate if
   * the instruction pointer exits the program. In version 0, it will also
   * terminate if `rcv` is executed with a non-zero argument.
   */
  const run = () => {
    if (ctx.state !== 'ready') {
      throw new Error(`Can't run because VM is ${ctx.state}`);
    }

    do {
      const { op, args } = program[ctx.ip];
      operations[op](ctx, args);

      if (ctx.state !== 'blocked') {
        ctx.ip++;

        if (ctx.ip < 0 || ctx.ip >= program.length) {
          ctx.state = 'terminated';
        }
      }
    } while (ctx.state === 'ready' && !(version === 0 && ctx.output.length));

    if (version === 0 && ctx.output.length) {
      ctx.state = 'terminated';
    }
  };

  /**
   * Empties the output queue and returns its former contents.
   *
   * @returns {Array} - the contents of the output queue
   */
  const flushOutput = () => {
    const output = ctx.output;
    ctx.output = [];
    return output;
  };

  return {
    input,
    run,
    flushOutput,
    getReg,
    setReg,
    /**
     * Returns the current state of the VM:
     *
     * - `'ready'`: The VM is ready to run.
     * - `'blocked'`: The VM is blocked on input. Invoking `run()` without
     *   first calling `input()` will throw an `Error`.
     * - `'terminated'`: The VM has terminated. Invoking `input()` or `run()`
     *   will throw an `Error`.
     *
     * @returns {string} - the current VM state
     */
    getState: () => ctx.state,
  };
};

/**
 * Converts the string Duet source to an array of instruction objects. Each
 * object has two properties:
 *
 * - `op`: The name of the operation to perform.
 * - `args`: An array of arguments for the operation. If an argument is a
 *   number, that value should be used directly. If it's a string, the value
 *   stored in the register with that name should be used instead.
 *
 * @param {*} input 
 * @returns 
 */
const parse = input => split(input).map(line => {
  const parts = line.split(' ');
  return {
    op: parts[0],
    args: parts.slice(1).map(arg => {
      const firstChar = arg.charAt(0);

      if (firstChar >= 'a' && firstChar <= 'z') {
        return arg;
      }

      return parseInt(arg, 10);
    }),
  };
});
