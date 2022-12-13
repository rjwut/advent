const Parser = require('./parser');
const DefaultProgram = require('./program.default');

const INTEGER_REGEXP = /^[+-]?\d+$/;

/**
 * Default implementation of `Parser`.
 */
class DefaultParser extends Parser {
  #opcodeMap;
  #opcodeSeparator;
  #argSeparator;

  /**
   * Creates a new `DefaultParser`.
   */
  constructor() {
    super();
    this.#opcodeMap = new Map();
    this.#opcodeSeparator = ' ';
    this.#argSeparator = ' ';
  }

  /**
   * Registers an opcode to be recognized by the parser. The implementation function receives two
   * arguments when invoked:
   *
   * - `vm` (`Vm`): A reference to the `Vm`
   * - `args` (`Array<number|string>`): The instruction arguments; each is either an integer or the
   *   string name of a register
   *
   * The implementation should not modify the instruction pointer unless execution should move to a
   * different instruction than the next offset.
   *
   * @param {*} opcode - the opcode to register
   * @param {Function} fn - the implementation of the corresponding operation
   */
  opcode(opcode, fn) {
    if (typeof fn !== 'function') {
      throw new Error('Operation implementation must be a function');
    }

    this.#opcodeMap.set(opcode, fn);
  }

  /**
   * @returns {string} - the string that separates the opcode from the arguments
   */
  get opcodeSeparator() {
    return this.#opcodeSeparator;
  }

  /**
   * @param {string} - the new opcode separator
   * @throws {TypeError} - if the separator is not a string
   */
  set opcodeSeparator(opcodeSeparator) {
    if (typeof opcodeSeparator !== 'string') {
      throw new TypeError('Opcode separator must be a string');
    }

    this.#opcodeSeparator = opcodeSeparator;
  }

  /**
   * @returns {string} - the string that separates arguments
   */
  get argSeparator() {
    return this.#argSeparator;
  }

  /**
   * @param {string} - the new arg separator
   * @throws {TypeError} - if the separator is not a string
   */
  set argSeparator(argSeparator) {
    if (typeof argSeparator !== 'string') {
      throw new TypeError('Argument separator must be a string');
    }

    this.#argSeparator = argSeparator;
  }

  /**
   * Default implementation of program parsing. This assumes:
   *
   * - The program is a string which contains lines delimited by `\n`. (Windows line endings are
   *   converted automatically.)
   * - Each line is a single instruction.
   * - An instruction starts with an opcode token, identifying an operation to perform.
   * - If there are arguments for the instruction, the opcode token is followed by an opcode
   *   separator (a space by default), followed by the arguments.
   * - Arguments are either integers, or strings naming registers.
   * - Arguments are delimited by an argument separator (a space by default).
   *
   * @param {string} source - the source code to parse
   * @returns {DefaultProgram} - the resulting program
   */
  parse(source) {
    return new DefaultProgram(
      source
      .replaceAll('\r', '') // deal with Windows line endings
      .trim()
      .split('\n')
      .map(line => this.#parseLine(line))
    );
  }

  /**
   * Looks up an opcode.
   *
   * @param {string} opcode - the opcode
   * @returns {Function} - the implementation
   * @throws {Error} - if the opcode is not recognized
   */
  getOperation(opcode) {
    const fn = this.#opcodeMap.get(opcode);

    if (!fn) {
      throw new Error(`Unrecognized opcode: ${opcode}`);
    }

    return fn;
  }

  /**
   * Parses the given source code line.
   *
   * @param {string} line - the source line
   * @returns {Object} - the parsed instruction
   */
  #parseLine(line) {
    const sepIndex = line.indexOf(this.#opcodeSeparator);
    let opcode, args;

    if (sepIndex === -1) {
      opcode = line;
      args = [];
    } else {
      opcode = line.substring(0, sepIndex);
      args = line.substring(sepIndex + this.#opcodeSeparator.length)
        .split(this.#argSeparator);
    }

    const fn = this.getOperation(opcode);
    args.forEach((arg, i) => {
      if (INTEGER_REGEXP.test(arg)) {
        args[i] = parseInt(arg, 10);
      }
    });
    return { fn, args };
  }
}

module.exports = DefaultParser;
