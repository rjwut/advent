const AssembunnyVm = require('./assembunny');

/**
 * # [Advent of Code 2016 Day 25](https://adventofcode.com/2016/day/25)
 *
 * This puzzle has new requirements of our VM:
 *
 * 1. The VM needs to support an `out` operation to output a value. So we implement the `out`
 *    operation and register it with the `Vm`. Fortunately, it has output support built in.
 * 2. We need to be able to stop the program if an output occurs that doesn't match the `0`, `1`,
 *    `0`, `1`,... pattern. We can do this by listening to the `output` event and calling
 *    `vm.terminate()` when a bad output is detected.
 * 3. We need to detect when the `Vm` has entered into an infinite loop. This can be defined as
 *    a state where all registers and the instruction pointer have the same values as a previous
 *    state. We can do this by listening to the `prestep` event and exporting the registers,
 *    converting that to a string, appending the instruction pointer, and storing those strings in a
 *    `Set`. If we ever go to store a new state string in the `Set` and find it's already there,
 *    we're in an infinite loop. If we detect this condition, we terminate the `Vm`.
 *
 * With these two event listeners in place, the `Vm` will eventually terminate. The starting value
 * of register `a` is valid when the following conditions are all true when the `Vm` terminates:
 *
 * - There has been at least two output values.
 * - The number of output values is even.
 * - There have been no invalid output values.
 *
 * We just test increasing start values for register `a` until we find the first one that meets
 * all of the above conditions; that's our answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const seenStates = new Set();
  const vm = new AssembunnyVm();
  vm.load(input);
  vm.on('output', value => {
    // Detect whether we've had an invalid output
    const expected = vm.outputLength % 2 === 0 ? 0 : 1

    if (value !== expected) {
      vm.terminate(new Error('Invalid output'));
    }
  });
  vm.on('prestep', () => {
    // Detect whether we've gone into an infinite loop
    const state = JSON.stringify(vm.exportRegisters()) + '/' + vm.ip;

    if (seenStates.has(state)) {
      vm.terminate();
    } else {
      seenStates.add(state);
    }
  });

  const keepSearching = () => vm.error || !vm.outputLength || vm.outputLength % 2 !== 0;

  let a = 0;

  do {
    vm.reset();
    seenStates.clear();
    vm.setRegister('a', ++a);
    vm.run();
  } while (keepSearching());

  return [ a, undefined ];
};
