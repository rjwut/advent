const Program = require('./program');

/**
 * Default implementation of `Program`.
 */
class DefaultProgram extends Program {
  #instructions;

  /**
   * Creates a new `Program` from the given array of instructions. Each instruction is an object
   * with two properties:
   *
   * - `fn` (`Function`): The operation to be performed by this instruction
   * - `args` (`Array<number|string>`): The instruction arguments; either integers or the string
   *   names of registers
   *
   * @param {Array<Object>} instructions - the instructions
   */
  constructor(instructions) {
    super();
    this.#instructions = instructions;
  }

  /**
   * @returns {number} - the program length; in the default case, this is equal to the number of
   * instructions, though subclasses may define "length" differently (Intcode, for example)
   */
  get length() {
    return this.#instructions.length;
  }

  /**
   * Executes the instruction at the given offset. If the offset is out of range of the list of
   * instructions, the `Vm` will be terminated normally.
   *
   * @param {Vm} vm - the `Vm` instance upon which to execute the instruction
   * @param {number} offset - the offset of the instruction to execute
   */
  execute(vm, offset) {
    if (offset < 0 || offset >= this.#instructions.length) {
      vm.terminate();
    } else {
      const { fn, args } = this.#instructions[offset];
      fn(vm, args);
    }
  }
}

module.exports = DefaultProgram;
