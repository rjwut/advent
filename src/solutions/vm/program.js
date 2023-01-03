/**
 * The `Program` interface. A program must extend this class or a subclass.
 */
class Program {
  /**
   * @returns {number} - the program length; in the default case, this is equal to the number of
   * instructions, though subclasses may define "length" differently (Intcode, for example)
   */
  get length() {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves the instruction at the given offset.
   *
   * @param {number} offset - the instruction offset
   */
  get(_offset) {
    throw new Error('Not implemented');
  }

  /**
   * Returns the offset in the program where the corresponding instruction fulfills the given
   * predicate.
   *
   * @param {Function} predicate - the predicate to use to test instructions
   * @returns {number} - the offset of the instruction which satisfies the predicate, or `-1` if no
   * such instruction is found
   */
  findOffset(_predicate) {
    throw new Error('Not implemented');
  }

  /**
   * Executes the instruction at the given offset.
   *
   * @param {Vm} vm - the `Vm` instance upon which to execute the instruction
   * @param {number} offset - the offset of the instruction to execute
   */
  execute(_vm, _offset) {
    throw new Error('Not implemented');
  }
}

module.exports = Program;
