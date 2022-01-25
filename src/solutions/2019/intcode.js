const { split } = require('../util');

/**
 * The operations supported by the Intcode interpreter.
 */
const OPERATIONS = {
  1: {
    /**
     * The `add` operation adds together the first two parameters and stores the
     * result in the address specified by the third parameter.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const arg0 = ctx.arg(0);
      const arg1 = ctx.arg(1);
      const address = ctx.argForWriting(2);
      const sum = arg0 + arg1;
      ctx.trace?.(`  ADD ${arg0} + ${arg1} = ${sum} -> ${address}`);
      ctx.writeMem(address, sum);
    },
    paramCount: 3,
  },

  2: {
    /**
     * The `multiply` operation multiplies the first two parameters and stores
     * the result in the address specified by the third parameter.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const arg0 = ctx.arg(0);
      const arg1 = ctx.arg(1);
      const address = ctx.argForWriting(2);
      const product = arg0 * arg1;
      ctx.trace?.(`  MULTIPLY ${arg0} * ${arg1} = ${product} -> ${address}`);
      ctx.writeMem(address, product);
    },
    paramCount: 3,
  },

  3: {
    /**
     * The `input` operation takes a value from the input array and stores it at
     * the address specified by the parameter.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const input = ctx.readInput();

      if (input !== undefined) {
        const address = ctx.argForWriting(0);
        ctx.trace?.(`  INPUT ${input} -> ${address}`);
        ctx.writeMem(address, input);
      } else {
        ctx.trace?.('  BLOCKED ON INPUT');
      }
    },
    paramCount: 1,
  },

  4: {
    /**
     * The `output` operation stores the value specified by the parameter in the
     * output array.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const value = ctx.arg(0);
      ctx.trace?.(`  OUTPUT ${value}`);
      ctx.writeOutput(value);
    },
    paramCount: 1,
  },

  5: {
    /**
     * The `jump-if-true` operation reads the first parameter and, if it is
     * non-zero, moves the instruction pointer to the address specified by the
     * second parameter. Otherwise, nothing happens.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const value = ctx.arg(0);
      const address = ctx.arg(1);
      ctx.trace?.(`  JUMP-IF-TRUE ${value} -> ${address}`);
  
      if (value !== 0) {
        ctx.jump(address);
      }
    },
    paramCount: 2,
  },

  /**
   * The `jump-if-false` operation reads the first parameter and, if it is
   * zero, moves the instruction pointer to the address specified by the second
   * parameter. Otherwise, nothing happens.
   *
   * @param {Object} ctx - the execution context
   */
  6: {
    execute: ctx => {
      const value = ctx.arg(0);
      const address = ctx.arg(1);
      ctx.trace?.(`  JUMP-IF-FALSE ${value} -> ${address}`);
  
      if (value === 0) {
        ctx.jump(address);
      }
    },
    paramCount: 2,
  },

  7: {
    /**
     * The `less-than` operation sets the address specified by the third
     * parameter to `1` if the first parameter is less than the second parameter
     * and `0` otherwise.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const arg0 = ctx.arg(0);
      const arg1 = ctx.arg(1);
      const address = ctx.argForWriting(2);
      const result = arg0 < arg1 ? 1 : 0;
      ctx.trace?.(`  LESS-THAN ${arg0} < ${arg1}: ${result} -> ${address}`);
      ctx.writeMem(address, result);
    },
    paramCount: 3,
  },

  8: {
    /**
     * The `equals` operation sets the address specified by the third parameter
     * to `1` if the first parameter is equal to the second parameter and `0`
     * otherwise.
     *
     * @param {Object} ctx - the execution context
     */
   execute: ctx => {
      const arg0 = ctx.arg(0);
      const arg1 = ctx.arg(1);
      const address = ctx.argForWriting(2);
      const result = arg0 === arg1 ? 1 : 0;
      ctx.trace?.(`  EQUALS ${arg0} = ${arg1}: ${result} -> ${address}`);
      ctx.writeMem(address, result);
    },
    paramCount: 3,
  },

  9: {
    /**
     * The `adjust-relative-base` operation adds the value of its parameter to
     * `state.relativeBase`.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      const arg0 = ctx.arg(0);
      ctx.trace?.(`  ADJUST RELATIVE BASE ${arg0}`);
      ctx.adjustRelativeBase(arg0);
    },
    paramCount: 1,
  },

  99: {
    /**
     * The `terminate` operation halts the program.
     *
     * @param {Object} ctx - the execution context
     */
    execute: ctx => {
      ctx.terminate();
    },
    paramCount: 0,
  },
};

/**
 * My implementation of the Intcode interpreter. It first appears on day 2,
 * then comes up in every odd-numbered day starting with day 5. A couple of
 * early puzzles introduce additions to the Intcode specification, which are
 * fortunately backwards compatible, so the same interpreter code can be used
 * for all days.
 *
 * This module exports a function that accepts an Intcode program (a
 * comma-delimited list of integers) as the only argument. The function returns
 * an object with two properties: `api` and `state`. The `api` property is an
 * object which provides methods for controlling the Intcode interpreter:
 *
 * - `input(value)`: Inputs `value` into the program. If the program is blocked
 *   on input, invoking this will unblock it.
 * - `run()`: Runs the program. An `Error` will be thrown if `state.status` is
 *   any value except `'ready'`.
 * - `step()`: Performs a single execution step. An `Error` will be thrown if
 *   `state.status` is any value except `'ready'`.
 * - `trace(`[stream.Writable]`): If provided with a `stream.Writeable`, a
 *   trace of the program execution will be written to the stream; otherwise,
 *   no trace will be written.
 *
 * The `state` property is an object which exposes internal interpreter state:
 *
 * - `address` (number): The current location of the instruction pointer.
 * - `error` (`Error`): An `Error` object describing why the program terminated
 *   abnormally, or `null` if the program has not terminated or did not throw
 *   an error.
 * - `inputQueue` (array): An array containing the input values that have been
 *   queued up but not yet consumed by the program. Invoking `api.input()`
 *   pushes a value onto this queue and unblocks the interpreter if it's
 *   blocked.
 * - `jumped` (boolean): Whether the last instruction executed resulted in the
 *   instruction pointer jumping.
 * - `memory` (array): The current state of the interpreter's memory.
 * - `output` (array): An array containing the values that have been output by
 *   the program. The Intcode interpreter only ever `push()`es values onto this
 *   array, so you are free to treat it as a queue and `shift()` values off it
 *   without concern that you will affect anything.
 * - `prevAddress` (number): The location of the instruction pointer before the
 *   most recent instruction was executed.
 * - `relativeBase` (number): The current value of the relative base. This is
 *   used for relative addressing (opcode 9).
 * - `status` (string): The current execution status:
 *   - `'ready'`: The program is ready to run a step.
 *   - `'blocked'`: The program is blocked waiting for input. Calling `step()`
 *     or `run()` in this state will throw an `Error`.
 *   - `'terminated'`: The program has terminated. If the program terminated
 *     abnormally, `error` will be set to an `Error` object; otherwise, it will
 *     be `null`. Calling `step()` or `run()` in this state will throw an
 *     `Error`.
 *
 * Note that directly manipulating any of the values under `state` may produce
 * unexpected behavior.
 * [Frobnicate](http://www.catb.org/~esr/jargon/html/F/frobnicate.html) with
 * caution.
 *
 * ## Execution
 *
 * The program starts with the instruction pointer at position `0`. Each time
 * `api.step()` is invoked, the following happens:
 *
 * 1. If `state.status` is not `'ready'`, throw an `Error`.
 * 2. Read the value at the instruction pointer.
 * 3. Break the value into two parts:
 *    - The ones and tens digits together form the _opcode_.
 *    - The remaining digits are the _parameter modes_. The hundreds digit
 *      represents the mode for the first parameter, the thousands digit for
 *      the second parameter, and so on.
 *    - A parameter mode of `0` indicates _position mode_, meaning that the
 *      parameter is the address of the value.
 *    - A parameter mode of `1` indicates _immediate mode_, meaning that the
 *      parameter is the value itself.
 *    - A parameter mode of `2` indicates _relative mode_, meaning that the
 *      parameter contains an address, which should then be offset by
 *      `state.relativeBase`. If `state.relativeBase` is `0`, parameter mode
 *      `2` is equivalent to parameter mode `0`.
 * 4. Use the opcode to look up the corresponding operation and execute it.
 *    Note that operations can have a varying number of parameters.
 * 5. If the operation threw an `Error`, set `state.error` to the error
 *    message, set `state.status` to `'terminated'`, and throw the `Error`.
 * 6. If the operation required input and no input is available, set
 *    `state.status` to `'blocked'`.
 * 7. If `state.status` is still `'ready'` and the instruction pointer was not
 *    moved by the instruction, move the instruction pointer forward to the
 *    next instruction (immediately after the last argument).
 *
 * Calling `api.run()` invokes `api.step()` repeatedly until `state.status` is
 * no longer equal to `'ready'`.
 *
 * ## Opcodes
 *
 * ### 1: Add (3 parameters)
 * Adds the first two parameters and stores the result in the memory location
 * indicated by the third.
 *
 * ### 2: Multiply (3 parameters)
 * Multiplies the first two parameters and stores the result in the memory
 * location indicated by the third.
 *
 * ### 3: Input (1 parameter)
 * Stores the next input value in the memory location indicated by the
 * parameter. If no input is available, the program is blocked until input is
 * provided.
 *
 * ### 4: Output (1 parameter)
 * Outputs its parameter.
 *
 * ### 5: Jump If True (2 parameters)
 * If the first parameter is non-zero, the instruction pointer is moved to the
 * memory location specified by the second parameter. Otherwise, nothing
 * happens.
 *
 * ### 6: Jump If False (2 parameters)
 * If the first parameter is zero, the instruction pointer is moved to the
 * memory location specified by the second parameter. Otherwise, nothing
 * happens.
 *
 * ### 7: Less Than (3 parameters)
 * If the first parameter is less than the second parameter, it stores a `1` in
 * the memory location indicated by the third parameter. Otherwise, it stores a
 * `0`.
 *
 * ### 8: Equals (3 parameters)
 * If the first parameter is equal to the second parameter, it stores a `1` in
 * the memory location indicated by the third parameter. Otherwise, it stores a
 * `0`.
 *
 * ### 9: Adjust Relative Base (1 parameter)
 * Adjusts the relative base by the value of its only parameter.
 *
 * ### 99: Terminate (0 parameters)
 * Terminates the program without an error.
 *
 * ## Possible Errors
 *
 * The `api.run()` and `api.step()` methods throw an `Error` if the program
 * terminates abnormally. The `state.error` property will also contain a
 * reference to the error. The following errors can cause abnormal program
 * termination:
 *
 * - *Invalid address*: An instruction attempted to access a negative address.
 * - *Unknown opcode*: The opcode for this instruction was not recognized.
 * - *Unknown parameter mode*: A mode for one of the parameters was not `0`,
 *   `1`, or `2`.
 * - *Infinite loop detected*: A jump instruction moved the instruction pointer
 *   back to the same address.
 *
 * Additionally, an `Error` will be thrown if `state.status` is not `'ready'`
 * when `api.run()` or `api.step()` is invoked. This won't change the value
 * stored in `state.error`.
 *
 * @param {Array} program - the program to execute
 * @returns {Object} - the execution results
 */
module.exports = program => {
  const state = {
    address: 0,
    error: null,
    inputQueue: [],
    jumped: false,
    memory: split(program, { delimiter: ',', parseInt: true }),
    output: [],
    prevAddress: 0,
    relativeBase: 0,
    status: 'ready',
    trace: null,
  };
  let modes;

  /**
   * If the given address is past the end of the memory array, it is expanded
   * to include it and filled with zeroes. If the address is negative, an
   * `Error` is thrown.
   *
   * @param {number} address - the address to check
   * @throws {Error} - if the address is negative
   */
  const checkAddress = address => {
    if (address < 0) {
      throw new Error(`Invalid address: ${address}`);
    }

    if (address >= state.memory.length) {
      // expand memory to include the given address
      const start = state.memory.length;
      state.memory.length = address + 1;
      state.memory.fill(0, start);
    }
  };

  /**
   * Reads the value at the given memory address.
   *
   * @param {number} address - the memory address to read
   * @returns {number} - the value at that address
   * @throws {Error} - if the address is negative
   */
  const readMemory = address => {
    checkAddress(address);
    return state.memory[address];
  };

  /**
   * Writes the indicated value at the given memory address.
   *
   * @param {number} address - the memory address to read
   * @param {number} value - the value to write
   * @throws {Error} - if the address is negative
   */
  const writeMemory = (address, value) => {
    checkAddress(address);
    state.memory[address] = value;
  };

  /**
   * Returns the mode for the parameter with the given index.
   *
   * @param {number} argIndex - the parameter index
   * @returns {number} - the parameter mode
   */
  const getMode = argIndex => {
    if (argIndex < modes.length) {
      return parseInt(modes.charAt(modes.length - argIndex - 1), 10);
    }

    return 0;
  };

  /**
   * Pushes a value onto the input queue.
   *
   * @param {number} value - the value to push
   * @throws {Error} - if the program is terminated
   */
  const onInput = value => {
    if (state.status === 'terminated') {
      throw new Error('Can\'t input after program has terminated');
    }

    state.inputQueue.push(value);
    state.status = 'ready';
  };

  // This object provides interpreter context to opcode executor functions.
  const ctx = {
    /**
     * Adds `delta` to `state.relativeBase`.
     *
     * @param {number} delta - the amount to add
     */
    adjustRelativeBase: delta => {
      state.relativeBase += delta;
    },

    /**
     * Retrieves the argument with the given index. Argument 0 is the value
     * immediately after the current position of the instruction pointer,
     * argument 1 is the value after that, and so on.
     *
     * The value actually returned depends on the parameter mode:
     *
     * - `0`: Return the value stored at the memory address specified by the
     *   argument.
     * - `1`: Return the value of the argument itself.
     *
     * @param {number} i - the argument index
     * @returns {number} - the value of the argument
     */
    arg: i => {
      const address = state.address + i + 1;
      const value = readMemory(address);
      const mode = getMode(i);

      switch (mode) {
        case 0:
          return readMemory(value);

        case 1:
          return value;

        case 2:
          return readMemory(value + state.relativeBase);

        default:
          throw new Error(`Unknown parameter mode: ${mode}`);
      }
    },

    /**
     * Same as `arg()`, except that it always returns a memory address for
     * writing a value, never a direct value.
     *
     * @param {number} i - the argument index
     * @returns {number} - the value of the argument
     */
    argForWriting: i => {
      const address = readMemory(state.address + i + 1);
      const mode = getMode(i);
      return mode === 2 ? address + state.relativeBase : address;
    },

    /**
     * Moves the instruction pointer to the `target` address.
     *
     * @param {number} target - the target address
     * @throws {Error} - if the target address is negative
     */
    jump: target => {
      checkAddress(target);
      state.address = target;
      state.jumped = true;
    },

    /**
     * Returns the next input value.
     *
     * @returns {number} - the next value from the input array
     */
    readInput: () => {
      if (state.inputQueue.length) {
        return state.inputQueue.shift();
      }

      state.status = 'blocked';
    },

    /**
     * Stops the program. If an error message is given, the program is
     * terminated abnormally.
     *
     * @param {string} [error] - the error message, if any
     */
    terminate: error => {
      if (typeof error === 'string') {
        error = new Error(error);
      }
      state.error = error || null;
      ctx.trace?.(`TERMINATED ${error ? `ABNORMALLY:\n${state.error.stack}` : 'NORMALLY'}`);
      state.status = 'terminated';

      if (error) {
        throw error;
      }
    },

    /**
     * If the `trace` option is set, logs the given message to the trace
     * stream. Use `ctx.trace?.(message)` to log a message (so that we avoid
     * the expense of message computation if we're not tracing).
     */
    trace: null,

    /**
     * Writes a value into memory.
     *
     * @param {number} address - the address to write to
     * @param {number} value - the value to write
     * @throws {Error} - if the address is negative
     */
    writeMem: (address, value) => {
      writeMemory(address, value);
    },

    /**
     * Writes a value to output.
     *
     * @param {number} value - the value to write
     */
    writeOutput: value => {
      state.output.push(value);
    },
  };

  /**
   * Runs the program until it terminates or blocks.
   */
  const run = () => {
    do {
      step();
    } while (state.status === 'ready');
  };

  /**
   * Performs a single execution step in the program.
   */
  const step = () => {
    if (state.status === 'terminated') {
      throw new Error('Can\'t continue execution after program has terminated');
    }

    if (state.status === 'blocked') {
      throw new Error('Can\'t continue execution while blocked on input');
    }

    ctx.trace?.(`ADDRESS ${state.address}`);
    state.prevAddress = state.address;
    state.jumped = false;
    const instruction = readMemory(state.address);
    const opcode = instruction % 100;
    const op = OPERATIONS[opcode];

    if (!op) {
      ctx.terminate(`Unknown opcode: ${opcode}`);
    }

    modes = String((instruction - opcode) / 100);
    ctx.trace?.(`  opcode=${opcode} modes=${modes}`);

    try {
      op.execute(ctx);

      if (state.status !== 'ready') {
        return;
      }

      if (!state.jumped) {
        state.address += op.paramCount + 1;
      }
    } catch (err) {
      ctx.terminate(err);
    }

    if (state.prevAddress === state.address) {
      ctx.terminate('Infinite loop detected');
    }
  };

  return {
    state,
    api: {
      input: onInput,
      run,
      step,
      trace: stream => {
        ctx.trace = stream ? message => stream.write(message + '\n') : null;
      },
    },
  };
};
