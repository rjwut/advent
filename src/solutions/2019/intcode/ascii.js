const IntcodeVm = require('.');

/**
 * A wrapper around the Intcode interpreter to permit ASCII input and output.
 * The exported function accepts the Intcode program source and returns a
 * simplified API for running the program.
 *
 * The supported output encodings are:
 *
 * - `'raw'`: The raw numeric array of output values from the Incode
 *   interpreter.
 * - `'ascii'` (default): The output values converted to ASCII encoding and
 *   returned as a string.
 * - `'both'`: An object with two properties: `raw` and `ascii`.
 *
 * @param {string} program - the Intcode program source
 * @param {string} [encoding='ascii'] - whether `run()` and `send()` should
 * return both the output codes and the translated text or just the text
 * @returns {Object} - the ASCII Intcode API
 */
module.exports = (program, encoding = 'ascii') => {
  const vm = new IntcodeVm();
  vm.load(program);

  /**
   * Translates the Intcode output to the desired output format.
   *
   * @returns {string|Object} - the output, depending on the `includeCodes`
   * value
   */
  const parseOutput = () => {
    const raw = vm.dequeueAllOutput();

    if (encoding === 'raw') {
      return raw;
    }

    const ascii = raw.map(code => String.fromCharCode(code)).join('');
    return encoding === 'both' ? { raw, ascii } : ascii;
  };

  return {
    /**
     * Executes the Intcode program without providing any input.
     *
     * @returns {string|Object} - the output, depending on the `includeCodes`
     * value
     * @throws {Error} - if the program is terminated or blocked
     */
    run: () => {
      vm.run();
      return parseOutput();
    },

    /**
     * Provides the given input string to the Intcode program, then runs it.
     *
     * @returns {string|Object} - the output, depending on the `includeCodes`
     * value
     * @throws {Error} - if the program is terminated
     */
     send: txt => {
      [ ...txt ].forEach(chr => {
        vm.enqueueInput(chr.charCodeAt(0));
      });
      vm.enqueueInput(10);
      vm.run();
      return parseOutput();
    },

    /**
     * Exposes the Intcode VM.
     */
    vm,
  };
};
