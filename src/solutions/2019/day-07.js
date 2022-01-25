const { permute } = require('../util');
const intcode = require('./intcode');

const PHASE_SETTINGS = [
  [ 0, 1, 2, 3, 4 ],
  [ 5, 6, 7, 8, 9 ],
];

/**
 * @todo Implement
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part whose answer should be returned
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  if (part !== undefined) {
    return findMaxSignal(input, PHASE_SETTINGS[part - 1]);
  }

  return PHASE_SETTINGS.map(phaseSettings => findMaxSignal(
    input,
    phaseSettings
  ));
};

const findMaxSignal = (program, phaseSettings) => {
  const permutations = permute(phaseSettings);
  let max = -Infinity;

  for (const permutation of permutations) {
    const signal = tryPermutation(program, permutation);
    max = Math.max(signal, max);
  }

  return max;
};

const tryPermutation = (program, permutation) => {
  const amplifiers = [];

  for (let phaseSetting of permutation) {
    const amplifier = intcode(program);
    amplifier.api.input(phaseSetting);
    amplifiers.push(amplifier);
  }

  const last = amplifiers[amplifiers.length - 1];
  let signal = 0;

  while (last.state.status !== 'terminated') {
    for (let amplifier of amplifiers) {
      amplifier.api.input(signal);
      amplifier.api.run();
      signal = amplifier.state.output[amplifier.state.output.length - 1];
    }
  }

  return signal;
};
