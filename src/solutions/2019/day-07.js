const { permute } = require('../util');
const IntcodeVm = require('./intcode');

const PHASE_SETTINGS = [
  [ 0, 1, 2, 3, 4 ],
  [ 5, 6, 7, 8, 9 ],
];

/**
 * There are two things that differ between the two parts:
 *
 * - The phase settings (`0` - `4` for part one, `5` - `9` for part two)
 * - The amplifiers are arranged in a feedback loop for part two
 *
 * Part one can actually be done in the feedback loop configuration, since the
 * program will terminate at the right time in part one anyway. So I created a
 * `findMaxSignal()` function that accepts the program and the available phase
 * settings, and returns the maximum signal. It does this by simply trying all
 * possible permutations of phase settings (the `permute()` function from my
 * `util` module makes this easy), and keeping track of the largest resulting
 * signal.
 *
 * The `tryPermutation()` function is responsible for computing the resulting
 * signal for a permutaiton. It spins up five new amplifiers and runs them
 * until the last one terminates, keeping track of the output signal from each
 * one as it goes so that it can be provided as the input for the next
 * amplifier. When the last amplifier terminates, the signal is returned.
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

/**
 * Returns the maximum signal that can be produced by any permutation of the
 * given phase settings.
 *
 * @param {string} program - the amplifier program
 * @param {Array} phaseSettings - the phase settings to try
 * @returns {number} - the maximum signal
 */
const findMaxSignal = (program, phaseSettings) => {
  const permutations = permute(phaseSettings);
  let max = -Infinity;

  for (const permutation of permutations) {
    const signal = tryPermutation(program, permutation);
    max = Math.max(signal, max);
  }

  return max;
};

/**
 * Returns the signal produced by the given permutation of phase settings.
 *
 * @param {string} program - the amplifier program
 * @param {Array} permutation - the phase settings permutation to try
 * @returns {number} - the resulting signal
 */
const tryPermutation = (program, permutation) => {
  const amplifiers = [];

  for (let phaseSetting of permutation) {
    const amplifier = new IntcodeVm();
    amplifier.load(program);
    amplifier.enqueueInput(phaseSetting);
    amplifiers.push(amplifier);
  }

  const last = amplifiers[amplifiers.length - 1];
  let signal = 0;

  while (last.state !== 'terminated') {
    for (let amplifier of amplifiers) {
      amplifier.enqueueInput(signal);
      amplifier.run();
      const output = amplifier.dequeueAllOutput();
      signal = output[output.length - 1];
    }
  }

  return signal;
};
