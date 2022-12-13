const IntcodeVm = require('./intcode');

/**
 * This puzzle has us adding a new feature to the Intcode computer; the actual
 * solution once the feature is added is trivial: Just input a `1` for part one
 * and a `2` for part two, run the program, and return the output value.
 *
 * See [the `intcode` module](./intcode.js) for implementation details for the
 * new feature.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ 1, 2 ].map(value => run(input, value));

const run = (program, input) => {
  const vm = new IntcodeVm();
  vm.load(program);
  vm.enqueueInput(input);
  vm.run();
  const output = vm.dequeueAllOutput();
  return output[output.length - 1];
};
