const Program = require('../vm/program');

class DeviceProgram extends Program {
  #parser;
  #programData;

  /**
   * Creates a new program.
   *
   * @param {DeviceParser} parser - the parser instance
   * @param {number[]} programData - the program data
   */
  constructor(parser, programData) {
    super();
    this.#parser = parser;
    this.#programData = programData;
  }

  /**
   * The length of the memory space.
   */
  get length() {
    return this.#programData.length;
  }

  /**
   * Retrieves the instruction at the given offset.
   *
   * @param {number} offset - the instruction offset
   */
  get(offset) {
    return this.#programData[offset];
  }

  /**
   * Returns the offset in the program where the corresponding instruction fulfills the given
   * predicate.
   *
   * @param {Function} predicate - the predicate to use to test instructions
   * @returns {number} - the offset of the instruction which satisfies the predicate, or `-1` if no
   * such instruction is found
   */
  findOffset(predicate) {
    return this.#programData.findIndex(predicate);
  }

  /**
   * Executes the instruction at the given offset. Memory is automatically expanded if `offset` is
   * past the end of the existing memory space.
   *
   * @param {Vm} vm - the `Vm` instance upon which to execute the instruction
   * @param {number} offset - the offset of the instruction to execute
   */
  execute(vm, offset) {
    const opcode = Number(this.#programData[offset]);
    const fn = this.#parser.getOperation(opcode);
    const arg = BigInt(this.#programData[offset + 1]);
    fn(vm, arg);
  }
}

module.exports = DeviceProgram;
