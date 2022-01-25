const { add } = require('../math2');
const { parse, buildVm } = require('./elfcode');

/**
 * # [Advent of Code 2018 Day 19](https://adventofcode.com/2018/day/19)
 *
 * Part one simply leverages the existing implementation of the instructions
 * described in the puzzle for [day 16](./day-16.js). We just create six
 * registers, set them all to zero, and run the program on them the register
 * that is bound to the instruction pointer goes out of range. The answer is
 * the value of the register `0` when the program terminates.
 *
 * Part two will take way too long to execute, so I have to find some other way
 * to get the answer. If you observe what the program does, you see that the
 * beginning of the program computes a value in register `2` that remains
 * unchanged for the rest of the program's execution. It turns out that the
 * value in register `0` when the program terminates is the sum of all the
 * factors of the value in register `2`.
 *
 * In part two, the number in register `2` is much larger, but now that we know
 * what the program is doing, we can simply capture that number, then compute
 * the sum of its factors ourselves. In part two, register `0` starts out set
 * to `1`, then gets changed back to `0` once register `2` has the desired
 * value in it. So we can watch register `0` as we step through the program
 * until it changes to `0`, then grab the number in register `2`. After that,
 * we just compute its factors and add them up.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const program = parse(input);
  return [ part1, part2 ].map(fn => fn(program));
};

/**
 * Computes the answer to part one of the puzzle, which is the value in
 * register `0` when the program terminates.
 *
 * @param {Array} program - the program to execute
 * @returns {number} - the answer to part one
 */
const part1 = program => {
  const vm = buildVm(program);

  do {
    vm.step();
  } while (!vm.terminated);

  return vm.regs[0];
};

/**
 * Computes the answer to part two of the puzzle, which is the sum of all the
 * factors of the number that the program sets in register `2` when register
 * `0` is set to `1` before running the program.
 *
 * @param {Array} program - the program to execute
 * @returns {number} - the answer to part two
 */
const part2 = program => {
  const vm = buildVm(program);
  vm.regs[0] = 1;

  do {
    vm.step();
  } while (vm.regs[0] === 1);

  return add(computeFactors(vm.regs[2]));
};

/**
 * Computes all factors of the given number.
 *
 * @param {nunber} n - the number to factorize
 * @returns {Array} - the factors of `n`
 */
const computeFactors = n => {
  const factors = [];
  const limit = Math.floor(Math.sqrt(n));

  for (let i = 1; i <= limit; i++) {
    if (n % i === 0) {
      factors.push(i);
      factors.push(n / i);
    }
  }

  return factors;
};
