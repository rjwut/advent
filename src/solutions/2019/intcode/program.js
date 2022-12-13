const Program = require('../../vm/program');

/**
 * `Program` implementation for Intcode.
 */
class IntcodeProgram extends Program {
  #parser;
  #memory;

  /**
   * Creates a new Intcode program.
   *
   * @param {IntcodeParser} parser - the parser instance
   * @param {Array<Array<number>>} memory - the initial memory state (with program data loaded)
   */
  constructor(parser, memory) {
    super();
    this.#parser = parser;
    this.#memory = memory;
  }

  /**
   * The length of the memory space.
   */
  get length() {
    return this.#memory.length;
  }

  /**
   * Executes the instruction at the given offset. Memory is automatically expanded if `offset` is
   * past the end of the existing memory space.
   *
   * @param {Vm} vm - the `Vm` instance upon which to execute the instruction
   * @param {number} offset - the offset of the instruction to execute
   */
  execute(vm, offset) {
    vm.trace(`ADDRESS ${offset}`);
    const instruction = this.#memory[offset];
    const opcode = instruction % 100;
    vm.parameterMode = Math.floor(instruction / 100);
    vm.trace(`  opcode=${opcode} modes=${vm.parameterMode}`);
    const fn = this.#parser.getOperation(opcode);
    const args = this.#memory.slice(offset + 1, offset + fn.argCount + 1);
    fn(vm, args);
  }

  /**
   * @returns {Array<number>} - the memory array
   */
  get memory() {
    return this.#memory;
  }

  /**
   * Reads a value from the memory array.
   *
   * @param {number} offset - the offset to read
   * @returns {number} - the value at that offset
   */
  read(offset) {
    if (!Number.isInteger(offset) || offset < 0) {
      throw new Error(`Illegal offset: ${offset}`);
    }

    return this.#memory[offset] ?? 0;
  }

  /**
   * Writes a value into the memory array.
   *
   * @param {number} offset - the offset to write
   * @param {number} value - the value to write
   */
  write(offset, value) {
    if (!Number.isInteger(offset) || offset < 0) {
      throw new Error(`Illegal offset: ${offset}`);
    }

    if (!Number.isInteger(value)) {
      throw new Error(`Intcode values may only be integers, not ${value}`);
    }

    if (offset >= this.#memory.length) {
      const start = this.#memory.length;
      this.#memory.length = offset + 1;
      this.#memory.fill(0, start, offset);
    }

    this.#memory[offset] = value;
  }
}

module.exports = IntcodeProgram;
