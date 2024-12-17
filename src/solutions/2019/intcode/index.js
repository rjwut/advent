const Vm = require('../../vm');
const IntcodeParser = require('./parser');

/**
 * The Intcode VM.
 */
class IntcodeVm extends Vm {
  #parameterMode;
  #relativeBase;

  /**
   * Creates a new Intcode VM.
   */
  constructor() {
    super({
      parser: new IntcodeParser(),
    });
    this.#parameterMode = 0;
    this.#relativeBase = 0;
  }

  /**
   * Evaluates an argument to its actual value. This considers the current parameter mode and
   * whether the value is intended to be a destination address for writing a value.
   *
   * @param {Array<number>} args - the arguments array
   * @param {number} index - the index of the argument to evaluate
   * @param {boolean} forWriting - whether the argument is an address to which a value should be
   * written
   * @returns {number} - the final argument value
   */
  eval(args, index, forWriting) {
    const param = args[index];
    const iMode = nthDigit(this.#parameterMode, index);
    let addr;

    switch (iMode) {
      case 0: // position mode
        return forWriting ? param : this.program.read(param);

      case 1: // immediate mode
        return param;

      case 2: // relative mode
        addr = param + this.#relativeBase;
        return forWriting ? addr : this.program.read(addr);

      default:
        throw new Error(`Unknown parameter mode: ${iMode}`);
    }
  }

  /**
   * Retrieves the current parameter mode. This is a value whose ones digit represents the mode for
   * the first argument, the tens digit for the second argument, and so on.
   *
   * @returns {number} - the parameter mode
   */
  get parameterMode() {
    return this.#parameterMode;
  }

  /**
   * @param {number} - the new parameter mode
   */
  set parameterMode(parameterMode) {
    this.#parameterMode = parameterMode;
  }

  /**
   * @returns {number} - the current relative base
   */
  get relativeBase() {
    return this.#relativeBase;
  }

  /**
   * @param {number} relativeBase - the new relative base
   */
  set relativeBase(relativeBase) {
    this.#relativeBase = relativeBase;
  }
}

/**
 * Returns the value of the digit in the given place: `0` = ones digit, `1` = tens digit, `2` =
 * hundreds digit, etc.
 *
 * @param {number} value - the value to read from
 * @param {number} n - the digit place to read
 * @returns {number} - that digit
 */
const nthDigit = (value, n) => Math.floor(value / (10 ** n)) % 10;

module.exports = IntcodeVm;
