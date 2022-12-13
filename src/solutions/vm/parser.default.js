const Parser = require('./parser');
const DefaultProgram = require('./program.default');

const INTEGER_REGEXP = /^-?\d+$/;

/**
 * Default implementation of `Parser`.
 */
class DefaultParser extends Parser {
  #opcodeMap;

  /**
   * Creates a new `DefaultParser`.
   */
  constructor() {
    super();
    this.#opcodeMap = new Map();
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
   * Default implementation of program parsing. This assumes:
   *
   * - The program is a string which contains lines delimited by `\n`. (Windows line endings are
   *   converted automatically.)
   * - Each line is a single instruction.
   * - Instructions are a list of tokens delimited by spaces.
   * - The first token is an opcode, identifying an operation to perform.
   * - The remaining tokens are arguments, which are either integers, or strings naming registers.
   *
   * @param {string} source - the source code to parse
   * @returns {DefaultProgram} - the resulting DefaultProgram
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
    const [ opcode, ...args ] = line.split(' ');
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
