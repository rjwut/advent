const AssembunnyVm = require('./assembunny');

/**
 * # [Advent of Code 2016 Day 12](https://adventofcode.com/2016/day/12)
 *
 * This puzzle got a lot simpler when I refactored it to leverage my new `Vm` class, which does
 * much of the gruntwork of running an _Advent of Code_-style virtual machine for you. See that
 * class for details.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  return [ 0, 1 ].map(initValue => {
    const vm = new AssembunnyVm();
    vm.load(input);
    vm.setRegister('c', initValue);
    vm.run();
    return vm.getRegister('a');
  });
};
