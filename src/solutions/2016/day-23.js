const AssembunnyVm = require('./assembunny');

/**
 * The patch to be applied to the Assembunny program to perform faster multiplication.
 *
 * @param {Vm} vm - the `Vm` instance to patch
 */
const PATCH = vm => {
  vm.setRegister('a', vm.getRegister('b') * vm.getRegister('d'));
  vm.setRegister('c', 0);
  vm.setRegister('d', 0);
  vm.ip += 7;
};

/**
 * # [Advent of Code 2016 Day 23](https://adventofcode.com/2016/day/23)
 *
 * Part one was not very difficult: We just needed to modify our existing `AssembunnyVm` class to
 * support the new `tgl` instruction. The `cpy`, `inc`, and `dec` operators also had to be updated
 * to ensure that they would do nothing if the last argument was not the name of a register. With
 * those changes in place, part one runs fine.
 *
 * Part two takes too long to run as is. An examination of the Assembunny program's source code
 * reveals that there is a double-nested loop from lines 4 to 10, inclusive:
 *
 * ```txt
 * cpy 0 a
 * cpy b c
 * inc a
 * dec c
 * jnz c -2
 * dec d
 * jnz d -5
 * ```
 *
 * The result of this double loop is that register `a` is set to the product of the values stored
 * in registers `b` and `d`, and registers `c` and `d` are set to `0`. We can speed up the program
 * by "patching" it with a function will execute this computation much more efficiently. I modified
 * my `Vm` class to support a new `patch()` method that lets you specify a function to execute
 * instead upon reaching a particular instruction. The function will provide a fast JavaScript
 * implementation of those instructions instead of running the slow Assembunny one. So now after we
 * parse the program, we patch it with this function, then run it as before. Now both parts of the
 * puzzle execute quickly.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ 7, 12 ].map(startValue => run(input, startValue));

/**
 * Feeds the program into the Assembunny VM, then patches it with a function that performs the
 * multiplication more efficiently.
 *
 * @param {string} program - the Assembunny program
 * @returns {Object} - the Assembunny VM with the patched program loaded in.
 */
const buildVm = program => {
  const vm = new AssembunnyVm();
  vm.load(program);
  // Find the start of the multiplication loops
  const patchIndex = vm.program.findOffset(instruction => {
    return instruction.opcode === 'cpy' && instruction.args.join() === '0,a'
  });
  vm.patch(patchIndex, PATCH);
  return vm;
};

/**
 * Builds the Assembunny VM with the patched program, loads `startValue` into
 * register `a`, runs the program, and returns the value in register `a`.
 *
 * @param {string} program - the Assembunny program
 * @param {number} startValue - the value to load into register `a`
 * @returns {number} - the value in register `a` after the program runs
 */
const run = (program, startValue) => {
  const vm = buildVm(program);
  vm.setRegister('a', startValue);
  vm.run();
  return vm.getRegister('a');
};
