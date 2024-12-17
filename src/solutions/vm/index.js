const { EventEmitter } = require('events');
const DefaultParser = require('./parser.default');

const IP_INCREMENT_VALUES = new Set([ 'never', 'unchanged', 'always' ]);

/**
 * A class for virtual machines. See [README.md](README.md) for details.
 */
class Vm extends EventEmitter {
  #options;
  #ip;
  #registers;
  #program;
  #input;
  #output;
  #state;
  #error;
  #patches;
  #zero;

  /**
   * Creates a new `Vm`.
   */
  constructor(options) {
    super();
    this.#options = {
      bigint: false,
      ipIncrement: 'unchanged',
      parser: new DefaultParser(),
      registerNames: undefined,
      throwUnheardErrors: true,
      ...options,
    };

    if (!IP_INCREMENT_VALUES.has(this.#options.ipIncrement)) {
      throw new Error(`Invalid ipIncrement option value: ${this.#options.ipIncrement}`);
    }

    this.#ip = 0;
    this.#registers = new Map();
    this.#zero = this.#options.bigint ? 0n : 0;
    this.#options.registerNames?.forEach(
      name => this.#registers.set(name, this.#zero)
    );
    this.#input = [];
    this.#output = [];
    this.#state = 'ready';
    this.#error = null;
    this.#patches = new Map();
  }

  /**
   * Loads the given source program. The source can be any value that can be parsed by the `Vm`'s
   * parser. Successfully loading a program will also cause the `Vm` to reset.
   *
   * @param {*} source - the program to load
   * @throws {Error} - if the program failed to parse
   */
  load(source) {
    this.#program = this.#options.parser.parse(source, this.#options.bigint);
    this.reset();
  }

  /**
   * Returns the VM state, which is one of the following:
   *
   * - `'ready'`: The VM is ready to execute instructions.
   * - `'running'`: The VM is currently executing.
   * - `'blocked'`: The VM is blocked on input.
   * - `'terminated'`: The VM has terminated.
   *
   * @returns {string} - the current state
   */
  get state() {
    return this.#state;
  }

  /**
   * @returns {Error|null} - the `Error` that caused the `Vm` to terminate; or `null` if the `Vm`
   * has not terminated or terminated normally
   */
  get error() {
    return this.#error;
  }

  /**
   * @returns {Parser} - the `Parser` instance
   */
  get parser() {
    return this.#options.parser;
  }

  /**
   * @returns {Program|undefined} - the `Program` instance, or `undefined` if none is loaded
   */
  get program() {
    return this.#program;
  }

  /**
   * @returns {number} - the current value of the instruction pointer register
   */
  get ip() {
    return this.#ip;
  }

  /**
   * @param {number} ip - the new value of the instruction pointer register
   * @throws {TypeError} - if `offset` is not an integer
   */
  set ip(ip) {
    if (!Number.isInteger(ip)) {
      throw new TypeError('Not an integer: ' + ip);
    }

    this.#ip = ip;
  }

  /**
   * Checks for the presence of the named register.
   *
   * @param {string} name - the register to check for
   * @returns {boolean} - whether the register exists
   */
  hasRegister(name) {
    return this.#registers.has(name);
  }

  /**
   * Returns the value of the named register.
   *
   * @param {string} name - the name of the register
   * @returns {number|bigint} - the register's value
   * @throws {Error} - if there's no register with that name
   */
  getRegister(name) {
    return this.#getRegisterValue(name);
  }

  /**
   * Sets the value of the named register.
   *
   * @param {string} name - the name of the register
   * @param {number|bigint} value - the value to set
   * @throws {Error} - if there's no register with that name
   * @throws {Error} - if `value` is not an integer
   */
  setRegister(name, value) {
    this.#getRegisterValue(name); // assert that the register exists
    this.#registers.set(name, this.#coerceValue(value));
  }

  /**
   * Adds the given value to the current value of the named register.
   *
   * @param {string} name - the name of the register
   * @param {number|bigint} value - the value to add
   * @throws {Error} - if there's no register with that name
   * @throws {Error} - if `value` is not an integer
   */
  addRegister(name, value) {
    const oldValue = this.#getRegisterValue(name);
    this.#registers.set(name, oldValue + this.#coerceValue(value));
  }

  /**
   * Returns a plain object containing the current state of the registers (including the
   * instruction pointer).
   *
   * @returns {Object} - the registers state
   */
  exportRegisters() {
    return Object.fromEntries(this.#registers);
  }

  /**
   * A convenience method that accepts an argument value and returns the value itself if it's a
   * number, or the value of the named register if it's a string.
   *
   * @param {number|string} arg - the argument to evaluate
   * @returns {number} - the corresponding value
   */
  eval(arg) {
    const argType = typeof arg;

    if (argType === 'number' || argType === 'bigint') {
      return arg;
    }

    return this.#getRegisterValue(arg);
  }

  /**
   * Enqueues an input value to be consumed by the program. If the `Vm` is blocked, invoking this
   * will unblock it.
   *
   * @param {number|bigint} value - the value to enqueue
   * @throws {TypeError} - if the value is not an integer
   */
  enqueueInput(value) {
    if (this.#state === 'terminated') {
      throw new Error('Program already terminated');
    }

    this.#input.push(this.#coerceValue(value));
    const unblocked = this.#state === 'blocked';
    this.#state = 'ready';

    if (unblocked) {
      this.emit('unblocked');
    }
  }

  /**
   * Reads an input value from the input queue. If there is no input available, the `Vm` will
   * block.
   *
   * @returns {number|bigint|undefined} - the input value, or `undefined` if we've blocked
   * @throws {Error} - if the program is terminated or we're already blocked on input
   */
  readInput() {
    if (this.#state === 'terminated') {
      throw new Error('Program already terminated');
    }

    if (this.#state === 'blocked') {
      throw new Error('VM is blocked on input');
    }

    if (this.#input.length) {
      return this.#input.shift();
    } else {
      this.#state = 'blocked';
      this.emit('blocked');
    }
  }

  /**
   * Causes the VM to emit an `output` event with the given value.
   *
   * @param {number|bigint} value - the value to output
   * @throws {Error} - if program is terminated or blocked on input
   * @throws {TypeError} - if `value` is not an integer
   */
  output(value) {
    if (this.#state === 'terminated') {
      throw new Error('Program already terminated');
    }

    if (this.#state === 'blocked') {
      throw new Error('VM is blocked on input');
    }

    this.emit('output', this.#coerceValue(value));
    this.#output.push(value);
  }

  /**
   * @returns {number} - the number of entries in the output queue
   */
  get outputLength() {
    return this.#output.length;
  }

  /**
   * @returns {Array<number|bigint>} - a copy of the output array (the output is not dequeued)
   */
  cloneOutput() {
    return [ ...this.#output ];
  }

  /**
   * @returns {number|bigint} - the next dequeued output value
   */
  dequeueOutput() {
    return this.#output.shift();
  }

  /**
   * @returns {Array<number|bigint>} - a copy of the output array (which is now dequeued)
   */
  dequeueAllOutput() {
    const output = this.#output;
    this.#output = [];
    return output;
  }

  /**
   * Advances execution by one instruction.
   *
   * @throws {Error} - if `Vm.state` is `'terminated'` or `'blocked'`
   */
  step() {
    this.#assertCanRun();
    this.#state = 'running';
    this.#step();

    if (this.#state === 'running') {
      this.#state = 'ready';
    }
  }

  /**
   * Executes instructions until the `Vm` blocks on input or terminates.
   */
  run() {
    this.#assertCanRun();
    this.#state = 'running';

    do {
      this.#step();
    } while(this.#state === 'running');
  }

  /**
   * Halts execution of the `Vm` while it's running, without terminating it. Execution may be
   * resumed by invoking `step()` or `run()`.
   */
  halt() {
    if (this.#state !== 'running') {
      throw new Error('Can\'t halt when not running');
    }

    this.#state = 'ready';
  }

  /**
   * Causes the `Vm` to stop running.
   *
   * @param {Error} [error] - the `Error` to report, if any
   */
  terminate(error) {
    this.#state = 'terminated';
    this.#error = error ?? null;
    this.emit('terminated', error);

    if (error && this.#options.throwUnheardErrors && !this.listenerCount('terminated')) {
      throw error;
    }
  }

  /**
   * Replaces an instruction with a function. When the instruction pointer reaches the given
   * offset, the given function will be executed instead of the instruction.
   *
   * @param {number} offset - the offset to patch
   * @param {Function} fn - the patch function
   */
  patch(offset, fn) {
    this.#patches.set(offset, fn);
  }

  /**
   * Resets the `Vm`. This does the following:
   *
   * - Sets the instruction pointer to `0`.
   * - Sets all registers to `0`.
   * - Clears the input and output queues.
   * - Sets the state to `'ready'`.
   * - Clears the value of the `error` property.
   *
   * All other state remains as-is.
   */
  reset() {
    for (let key of this.#registers.keys()) {
      this.#registers.set(key, this.#zero);
    }

    this.#ip = 0;
    this.#input = [];
    this.#output = [];
    this.#state = 'ready';
    this.#error = null;
  }

  /**
   * Asserts that the given value is an integer, and coercing it to a number or bigint as
   * appropriate.
   *
   * @param {number|bigint} value - the value to test
   * @returns {number|bigint} - the value, possibly converted to a `bigint`
   * @throws {TypeError} - if `value` is not an integer
   */
  #coerceValue(value) {
    const valueType = typeof value;

    if (valueType === 'bigint' || Number.isInteger(value)) {
      return this.#options.bigint ? BigInt(value) : Number(value);
    }

    throw new TypeError(`Not an integer: ${value}`);
  }

  /**
   * Performs a single execution step. Unlike `step()`, this method performs no state checking
   * first.
   */
  #step() {
    this.emit('prestep');
    const ip = this.ip;

    if (ip < 0 || ip >= this.#program.length) {
      this.terminate();
      return;
    }

    try {
      // Has this instruction been patched?
      const patch = this.#patches.get(ip);

      if (patch) {
        patch(this);
      } else {
        this.emit('preop');
        this.#program.execute(this, ip);
        this.emit('postop');
      }

      // Determine whether we should increment the instruction pointer.
      if (this.#state === 'running' && this.#options.ipIncrement !== 'never') {
        if (this.#options.ipIncrement === 'always' || this.ip === ip) {
          this.ip++;
        }
      }

      this.emit('poststep');
    } catch (error) {
      this.terminate(error);
    }
  }

  /**
   * @throws {Error} - if the `Vm` can't run right now.
   */
  #assertCanRun() {
    if (this.#state === 'terminated') {
      throw new Error('Program has already terminated');
    }

    if (this.#state === 'blocked') {
      throw new Error('VM is blocked on input');
    }

    if (this.#state === 'running') {
      throw new Error('Program is already running');
    }
  }

  /**
   * Retrieves the value of the named register, or throws an `Error` if it doesn't exist.
   *
   * @param {string} name - the name of the register
   * @returns {number} - the register value
   * @throws {Error} - if the register doesn't exist
   */
  #getRegisterValue(name) {
    const value = this.#registers.get(name);

    if (value === undefined) {
      if (this.#options.registerNames === undefined) {
        this.#registers.set(name, this.#zero);
        return this.#zero;
      }

      throw new Error(`Register does not exist: ${name}`);
    }

    return value;
  }
}

module.exports = Vm;
