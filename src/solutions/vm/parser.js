/**
 * The `Parser` interface. A parser must extend this class or a subclass.
 */
class Parser {
  /**
   * Parses the source code into a `Program`.
   *
   * @param {*} source - the source code to parse
   * @returns {Program} - the resulting `Program`
   * @throws {Error} - if the source could not be parsed
   */
  parse() {
    throw new Error('Not implemented');
  }
}

module.exports = Parser;
