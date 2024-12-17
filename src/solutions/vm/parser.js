/**
 * The `Parser` interface. A parser must extend this class or a subclass.
 */
class Parser {
  /**
   * Parses the source code into a `Program`.
   *
   * @param {*} source - the source code to parse
   * @param {boolean} bigint - if numbers should be treated as bigints
   * @returns {Program} - the resulting `Program`
   * @throws {Error} - if the source could not be parsed
   */
  parse(_source, _bigint) {
    throw new Error('Not implemented');
  }
}

module.exports = Parser;
