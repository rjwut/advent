const intcode = require('./intcode');

/**
 * @todo Implement
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ 1, 2 ].map(value => run(input, value));

const run = (program, input) => {
  const { api, state } = intcode(program);
  api.input(input);
  api.run();
  return state.output[0];
};
