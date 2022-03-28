const assembunny = require('./assembunny');

/**
 * # [Advent of Code 2016 Day 12](https://adventofcode.com/2016/day/12)
 *
 * @todo Describe solution
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  return [ 0, 1 ].map(initValue => {
    const vm = assembunny(input);
    vm.ctx.regs.c = initValue;
    vm.run();
    return vm.ctx.regs.a;
  });
};
