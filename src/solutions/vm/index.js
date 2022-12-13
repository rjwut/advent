const { EventEmitter } = require('events');
const Parser = require('./parser.default');

const DEFAULT_IP_NAME = 'ip';
const DEFAULT_BREAKPOINT_CONDITION = () => true;

/**
 * This class lets you define and build a simple virtual machine that executes programs written in
 * a customized machine language. You can programmatically declare the registers and operations the
 * `Vm` supports, and you can extend the class to create additional functionality.
 *
 * ## Classes and Interfaces
 *
 * - `Vm`: This class represents the entire virtual machine and has methods for controlling it.
 * - `Parser`: An interface for objects which can parse source code into instructions. Its
 *   `parse()` method is expected to accept the source code and return an instance of `Program`.
 * - `DefaultParser`: The default implementation of the `Parser` interface. See the
 *   **Default Implementation** section below for details.
 * - `Program`: An interface which represents the code being executed. Can execute any single
 *   instruction given its offset.
 * - `DefaultProgram`: The default implementation of `Program` which will be used when another is
 *   not provided. See the **Default Implementation** section below for details.
 *
 * Since JavaScript does not have the explicit concept of an interface, they are implemented as
 * classes whose methods throw `Error`s. When you extend these interfaces, you must override the
 * methods with your own implementations.
 *
 * ## Basic Usage
 *
 * The basic steps for using a `Vm` is as follows:
 *
 * 1. Instantiate the `Vm`.
 * 2. `load()` the source code.
 * 3. Declare any needed registers.
 * 4. Declare opcodes.
 * 4. Invoke `run()`.
 * 5. Inspect the `Vm` for results.
 *
 * For example:
 *
 * - The program is a string stored in a variable named `source`.
 * - The program expects there to be two registers named `a` and `b`.
 * - The program has two opcodes, `add` and `jump`, which you have implemented as functions with
 *   the same names.
 * - After running the program, you wish to print out the value of the `a` register.
 *
 * This is what that would look like:
 *
 * ```js
 * const vm = new Vm();
 * vm.declareRegisters('a', 'b');
 * vm.parser.opcode('add', add);
 * vm.parser.opcode('jump', jump);
 * vm.load(source);
 * vm.run();
 * console.log(vm.getRegister('a'));
 * ```
 *
 * ## Registers
 *
 * The `Vm` will have one or more registers. By default, the only register is one called `ip`, the
 * instruction pointer. This register keeps track of the program offset where the `Vm` is currently
 * executing. You may rename this register by calling `declareIp()`. Programs may directly
 * manipulate the instruction pointer like any other register. The value of the instruction pointer
 * register, whatever its name, is also exposed by the `Vm`'s `ip` property.
 *
 * You may declare additional registers to be used by programs executed by the `Vm` by invoking the
 * `declareRegisters()` method. The instruction pointer register need not be included in the list
 * of registers you provide to this method. Unlike `declareIp()`, invoking it multiple times does
 * not remove any previously-declared registers. Registers can be manipulated on the `Vm` instance
 * via the `getRegister()`, `setRegister()`, and `addRegister()` methods.
 *
 * All registers start with a value of `0`. If the program references a register during execution
 * that has not been declared, it will throw an `Error`.
 *
 * ## Execution
 *
 * Execute your program by invoking `run()`. This will cause the `Vm` to execute instructions until
 * one of the following occurs:
 *
 * - The program terminates normally.
 * - An error occurs.
 * - The VM becomes blocked on input. (See the **Input** section below.)
 * - The VM encounters a breakpoint. (See the **Breakpoints** section below.)
 *
 * The `state` property is a string that describes the current state of the `Vm`:
 *
 * - `'ready'`: The `Vm` is ready to execute instructions. You may invoke `step()` or `run()` to
 *    proceed.
 * - `'running'`: The `Vm` is currently executing instructions.
 * - `'blocked'`: The `Vm` is blocked on input. You must invoke `enqueueInput()`, which will change
 *   the state to `'ready'`.
 * - `'terminated'`: The `Vm` has ended (possibly with an error).
 *
 * ## Events
 *
 * The `Vm` class extends `EventEmitter`. These are the events which it can emit during execution:
 *
 * - `prestep`: The `Vm` is about to execute an instruction.
 * - `poststep`: The `Vm` just finished executing an instruction. Not invoked if the instruction
 *   threw an error.
 * - `output`: The `Vm` has produced an output value (provided as an argument).
 * - `blocked`: The `Vm` is blocked on input.
 * - `breakpoint`: The `Vm` has paused on a breakpoint. Breakpoints are only considered while the
 *   `Vm` is `run()`ing.
 * - `unblocked`: The `Vm` is no longer blocked on input.
 * - `terminated`: The `Vm` has terminated. If termination was the result of an `Error`, it will
 *   be provided as an argument.
 *
 * Use the standard `EventEmitter` methods to subscribe to these events.
 *
 * ## Input
 *
 * The `enqueueInput()` method allows you to submit input to the program, which is queued until the
 * program requests it. If the program requests input and the input queue is empty, it will stop
 * executing. This is referred to as being "blocked on input." You may invoke `enqueueInput()` to
 * unblock it, then invoke `run()` or `step()` to continue execution. Only integers are allowed as
 * input values.
 *
 * When writing operation implementations, you may retrieve queued input with the `readInput()`
 * method. If no input is available, `readInput()` may return `undefined`; in this case, you should
 * immediately exit the instruction and not move in instruction pointer.
 *
 * ## Output
 *
 * The `Vm` emits an `output` event each time output is produced; register a listener for this
 * event to receive the output. To emit output in your operation implementation, invoke the
 * `output()` method. Only integers are valid output values.
 *
 * ## `Parser`
 *
 * A `Parser` is responsible for converting source code into a `Program` instance. The `parser`
 * property on the `Vm` is set to the `Parser` instance that will be used by the `Vm` to parse your
 * program. By default, this will be an instance of `DefaultParser`. To use your own parser, do the
 * following:
 *
 * 1. Write a class that extends `Parser`.
 * 2. Implement the `parse()` method. Return an instance of a `Program` subclass.
 * 3. Set the `parser` property of the `Vm` to an instance of your new `Parser` subclass.
 *
 * ## `Program`
 *
 * The `Program` interface is for objects that are responsible for actually executing the
 * instruction at any given offset. `DefaultParser` returns a `DefaultProgram` instance when
 * parsing the source code. You may provide your own `Program` subclass and write a custom `Parser`
 * to return it.
 *
 * ## Default Parsing and Execution Behavior
 *
 * The `DefaultParser` expects the source to be a mutli-line string. (Windows line endings are
 * automatically converted to newlines.) Each line is an instruction consisting of one or more
 * space-separated tokens. The first token is an opcode; any remaining ones are either integers or
 * the names of registers. Before parsing, opcodes must be registered by invoking
 * `DefaultParser.opcode()`. This is how you provide the behavior for each opcode. If an unknown
 * opcode is encountered, an error will be thrown.
 *
 * The `opcode()` method expects two arguments: the opcode to register, and a function implementing
 * that operation. The implementation function will receive to arguments when invoked: a reference
 * to the `Vm` instance, and an array of the arguments for the instruction. Each argument is either
 * an integer or a string naming a register. (An argument token will be considered an integer if it
 * matches the `RegExp` `/^-?\d+$/`). If the parser encounters an unknown register name, it will
 * throw an `Error`. The `Vm.eval()` method will automatically coerce arguments to their actual
 * values for you.
 *
 * If an instruction modified the instruction pointer, the next step will execute the instruction
 * at that location. If the instruction pointer is still at the same location it was just before
 * the instruction was executed, the `Vm` will automatically increment it to point at the next
 * instruction.
 *
 * Execution terminates either when you invoke `terminate()`, or the instruction pointer moves
 * outside the list of instructions.
 *
 * ## Tracing
 *
 * You can cause debugging messages to be output by using the tracing feature. Tracing is off by
 * default; to activate tracing, invoke `setTrace()` to a `stream.Writable` where you want the
 * tracing messages written. To output a trace message, pass it to `trace()`.
 *
 * ## Breakpoints
 *
 * The `Vm` supports setting a breakpoint at any offset, which will cause execution to
 * automatically halt when the breakpoint is encountered while it is `run()`ning. Breakpoints are
 * not trigged when `step()`ping through the program. You can set and clear breakpoints using the
 * `setBreakpoint()`, `clearBreakpoint()`, and `clearAllBreakpoints()` methods. You may optionally
 * specify a condition for a breakpoint. The condition is a function that receives a reference to
 * the `Vm` instance. If a condition is provided for a breakpoint, execution will only halt there
 * if the conditional function returns a truthy value.
 */
class Vm extends EventEmitter {
  #registers;
  #ipName;
  #parser;
  #program;
  #input;
  #state;
  #trace;
  #breakpoints;

  /**
   * Creates a new `Vm`.
   */
  constructor() {
    super();
    this.#registers = new Map();
    this.#registers.set(DEFAULT_IP_NAME, 0);
    this.#ipName = DEFAULT_IP_NAME;
    this.#parser = new Parser();
    this.#input = [];
    this.#state = 'ready';
    this.#breakpoints = new Map();
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
  }

  /**
   * Sets a breakpoint at the named offset. If that offset is reached while the
   * `Vm` is `run()`ning, a `breakpoint` event will be fired. Breakpoints do
   * not fire while `step()`ping.
   *
   * @param {number} offset - the offset on which to set the breakpoint
   * @param {Function} [condition] - a predicate that causes execution to stop at the breakpoint
   * only if its condition is met
   * @throws {TypeError} - if `offset` is not an integer
   * @throws {Error} - if `offset` is out of range
   */
  setBreakpoint(offset, condition) {
    if (this.isOutOfRange(offset)) {
      throw new Error(`Offset out of range: ${offset}`);
    }

    this.#breakpoints.put(offset, condition ?? DEFAULT_BREAKPOINT_CONDITION);
  }

  /**
   * Removes any breakpoint that might exist at the given offset.
   *
   * @param {number} offset - the offset on which to set the breakpoint
   * @throws {TypeError} - if `offset` is not an integer
   * @throws {Error} - if `offset` is out of range
   */
  clearBreakpoint(offset) {
    if (this.isOutOfRange(offset)) {
      throw new Error(`Offset out of range: ${offset}`);
    }

    this.#breakpoints.delete(offset);
  }

  /**
   * Removes all breakpoints.
   */
  clearAllBreakpoints() {
    this.#breakpoints.clear();
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
   * Executes instructions until the `Vm` blocks on input, hits a breakpoint, or terminates.
   */
  run() {
    this.#assertCanRun();
    this.#state = 'running';

    do {
      this.#step();

      if (this.#state === 'running') {
        const breakpoint = this.#breakpoints.get(this.ip);

        if (breakpoint?.(this)) {
          this.#state = 'ready';
          this.emit('breakpoint');
        }
      }
    } while(this.#state === 'running');
  }

  /**
   * Causes the `Vm` to stop running.
   *
   * @param {Error} [error] - the `Error` to report, if any
   */
  terminate(error) {
    this.#state = 'terminated';

    if (this.listeners('terminated').length) {
      this.emit('terminated', error);
    } else if (error) {
      throw error;
    }
  }

  /**
   * If set to a `stream.Writable` object, any messages passed to `trace()` will be written to that
   * object. Set to `null` or `undefined` to turn tracing back off.
   *
   * @param {Writable} writable - where trace messages should be written
   */
  setTrace(writable) {
    this.#trace = writable;
  }

  /**
   * Writes a trace message for debugging purposes. By default, tracing is turned off; invoke
   * `setTrace()` and pass in a `stream.Writable` to turn it on.
   *
   * @param {string} - the trace message to print
   */
  trace(message) {
    this.#trace?.write(message + '\n')
  }

  /**
   * Resets the `Vm`. This does the following:
   *
   * - Sets all registers (including the instruction pointer) to `0`.
   * - Clears the input queue.
   * - Unregisters all event listeners.
   * - Sets the state to `'ready'`.
   *
   * The program remains in memory as-is.
   */
  reset() {
    for (let key of this.#registers.keys()) {
      this.#registers.set(key, 0);
    }

    this.#input = [];
    this.removeAllListeners();
    this.#state = 'ready';
  }

  /**
   * Performs a single execution step. Unlike `step()`, this method performs no state checking
   * first.
   */
  #step() {
    this.emit('prestep');
    let ip = this.ip;

    try {
      this.#program.execute(this, ip);

      if (this.#state === 'running' && this.ip === ip) {
        // Instruction pointer hasn't moved; increment it.
        this.ip = ip + 1;
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
      throw new Error(`Register does not exist: ${name}`);
    }

    return value;
  }
}

module.exports = Vm;
