const { EventEmitter } = require('events');
const Parser = require('./parser.default');

const DEFAULT_IP_NAME = 'ip';
const IP_INCREMENT_VALUES = new Set([ 'never', 'unchanged', 'always' ]);

/**
 * A class for virtual machines. See [README.md](README.md) for details.
 */
class Vm extends EventEmitter {
  #registers;
  #lazyRegisters;
  #ipIncrement;
  #throwUnheardErrors;
  #ipName;
  #parser;
  #program;
  #input;
  #output;
  #state;
  #error;
  #patches;

  /**
   * Creates a new `Vm`.
   */
  constructor() {
    super();
    this.#registers = new Map();
    this.#lazyRegisters = false;
    this.#ipIncrement = 'unchanged';
    this.#throwUnheardErrors = true;
    this.#registers.set(DEFAULT_IP_NAME, 0);
    this.#ipName = DEFAULT_IP_NAME;
    this.#parser = new Parser();
    this.#input = [];
    this.#output = [];
    this.#state = 'ready';
    this.#error = null;
    this.#patches = new Map();
  }

  /**
   * @returns {boolean} - whether registers will be automatically declared upon first use
   */
  get lazyRegisters() {
    return this.#lazyRegisters;
  }

  /**
   * @param {*} lazyRegisters - whether registers will be automatically declared upon first use
   * (truthy) or if an error will be thrown (falsy)
   */
  set lazyRegisters(lazyRegisters) {
    this.#lazyRegisters = !!lazyRegisters;
  }

  /**
   * Tells the `Vm` whether it should auto-increment the instruction pointer after an operation
   * completes. The possible values are:
   *
   * - `'never'`: Leave it alone. The instruction pointer only moves when explicitly changed by
   *   setting the `ip` property (or updating the corresponding register).
   * - `'unchanged'` (default): On completion of an operation, if the instruction pointer still
   *   points to the same instruction as it did just before the operation, the `Vm` will
   *   automatically increment it. Otherwise, it will be left alone.
   * - `'always'`: The instruction pointer is always incremented after an operation completes,
   *   even if the operation already moved it.
   *
   * @returns {string} - when the instruction pointer should be auto-incremented
   */
  get ipIncrement() {
    return this.#ipIncrement;
  }

  /**
   * @param {string} - the new ipIncrement value
   */
  set ipIncrement(ipIncrement) {
    if (!IP_INCREMENT_VALUES.has(ipIncrement)) {
      throw new Error(`Invalid ipIncrement value: ${ipIncrement}`);
    }

    this.#ipIncrement = ipIncrement;
  }

  /**
   * @returns {boolean} - whether the `Vm` will throw any raised `Error` if there are no `error`
   * event listeners
   */
  get throwUnheardErrors() {
    return this.#throwUnheardErrors;
  }

  /**
   * @param {*} - a truthy value causes the `Vm` to throw if an `Error` occurs and there are no
   * registered `error` listeners; a falsy value cause it to simply terminate; in any case, the
   * `Error` is still available via the read-only `error` property
   */
  set throwUnheardErrors(throwUnheardErrors) {
    this.#throwUnheardErrors = !!throwUnheardErrors;
  }

  /**
   * Creates new registers with the given names. Each named register will be set to `0`. The
   * instruction pointer register can be omitted. If it is not named `ip`, register it using the
   * `declareIp()` method.
   *
   * @param {...any} names - the registers to create
   */
  declareRegisters(...names) {
    names.forEach(name => {
      this.#registers.set(name, 0);
    });
  }

  /**
   * Changes the name of the instruction pointer. The old instruction pointer register will be
   * deleted, and a new one will be created with the given name and set to `0`. If `declareIp()` is
   * never invoked, the instruction pointer will be named `ip`.
   *
   * @param {string} name - the name of the instruction pointer.
   */
  declareIp(name) {
    this.#registers.delete(this.#ipName);
    this.#ipName = name;
    this.#registers.set(name, 0);
  }

  /**
   * Loads the given source program. The source can be any value that can be parsed by the `Vm`'s
   * parser. Successfully loading a program will also cause the `Vm` to reset.
   *
   * @param {*} source - the program to load
   * @throws {Error} - if the program failed to parse
   */
  load(source) {
    this.#program = this.#parser.parse(source);
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
    return this.#parser;
  }

  /**
   * @param {Parser} parser - the `Parser` instance to use
   * @throws {TypeError} - if the argument is not a `Parser` instance
   */
  set parser(parser) {
    if (!(parser instanceof Parser)) {
      throw new TypeError('Argument is not an instance of the Parser class');
    }

    this.#parser = parser;
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
    return this.#registers.get(this.#ipName);
  }

  /**
   * @param {number} ip - the new value of the instruction pointer register
   * @throws {TypeError} - if `offset` is not an integer
   */
  set ip(offset) {
    if (!Number.isInteger(offset)) {
      throw new TypeError('Instruction pointer offset must be an integer');
    }

    this.#registers.set(this.#ipName, offset);
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
   * @returns {number} - the register's value
   * @throws {Error} - if there's no register with that name
   */
  getRegister(name) {
    return this.#getRegisterValue(name);
  }

  /**
   * Sets the value of the named register.
   *
   * @param {string} name - the name of the register
   * @param {number} value - the value to set
   * @throws {Error} - if there's no register with that name
   * @throws {Error} - if `value` is not an integer
   */
  setRegister(name, value) {
    this.#getRegisterValue(name); // assert that the register exists

    if (!Number.isInteger(value)) {
      throw new TypeError('Register values must be integers');
    }

    this.#registers.set(name, value);
  }

  /**
   * Adds the given value to the current value of the named register.
   *
   * @param {string} name - the name of the register
   * @param {number} value - the value to add
   * @throws {Error} - if there's no register with that name
   * @throws {Error} - if `value` is not an integer
   */
  addRegister(name, value) {
    const oldValue = this.#getRegisterValue(name); // assert that the register exists

    if (!Number.isInteger(value)) {
      throw new TypeError('Register values must be integers');
    }

    this.#registers.set(name, oldValue + value);
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
    if (typeof arg === 'number') {
      return arg;
    }

    return this.#getRegisterValue(arg);
  }

  /**
   * Enqueues an input value to be consumed by the program. If the `Vm` is blocked, invoking this
   * will unblock it.
   *
   * @param {number} value - the value to enqueue
   * @throws {TypeError} - if the value is not an integer
   */
  enqueueInput(value) {
    if (this.#state === 'terminated') {
      throw new Error('Program already terminated');
    }

    if (!Number.isInteger(value)) {
      throw new TypeError('Input must be an integer');
    }

    this.#input.push(value);
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
   * @returns {number|undefined} - the input value, or `undefined` if we've blocked
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
   * @param {number} value - the value to output
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

    if (!Number.isInteger(value)) {
      throw new TypeError('Output value must be an integer');
    }

    this.emit('output', value);
    this.#output.push(value);
  }

  /**
   * @returns {number} - the number of entries in the output queue
   */
  get outputLength() {
    return this.#output.length;
  }

  /**
   * @returns {Array<number>} - a copy of the output array (the output is not dequeued)
   */
  cloneOutput() {
    return [ ...this.#output ];
  }

  /**
   * @returns {number} - the next dequeued output value
   */
  dequeueOutput() {
    return this.#output.shift();
  }

  /**
   * @returns {Array<number>} - a copy of the output array (which is now dequeued)
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

    if (error && this.#throwUnheardErrors && !this.listenerCount('terminated')) {
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
   * - Sets all registers (including the instruction pointer) to `0`.
   * - Clears the input and output queues.
   * - Sets the state to `'ready'`.
   * - Clears the value of the `error` property.
   *
   * All other state remains as-is.
   */
  reset() {
    for (let key of this.#registers.keys()) {
      this.#registers.set(key, 0);
    }

    this.#input = [];
    this.#output = [];
    this.#state = 'ready';
    this.#error = null;
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
      if (this.#state === 'running' && this.#ipIncrement !== 'never') {
        if (this.#ipIncrement === 'always' || this.ip === ip) {
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
      if (this.#lazyRegisters) {
        this.#registers.set(name, 0);
        return 0;
      }

      throw new Error(`Register does not exist: ${name}`);
    }

    return value;
  }
}

module.exports = Vm;
