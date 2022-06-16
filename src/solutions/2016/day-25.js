const assembunny = require('./assembunny');

/**
 * # [Advent of Code 2016 Day 25](https://adventofcode.com/2016/day/25)
 *
 * This puzzle requires three changes to our `assembunny` VM:
 *
 * 1. We have to add the `out` operation. To support this, I created an
 *    `output` property on the context object, which is set to an empty array.
 *    Every time `out` runs, it pushes the value onto that array.
 * 2. Since we're running the same program over and over, it's convenient to
 *    have a `reset()` method to change all the registers to `0`, move the
 *    instruction pointer to the start of the program, and empty the output
 *    array.
 * 3. We need to be able to terminate the program if it goes into an infinite
 *    loop or if we see that an output value doesn't follow the `0`, `1`, `0`,
 *    `1`, ... pattern indicated by the puzzle. So I changed `run()` so it
 *    accepts an optional break condition function. This function gets invoked
 *    before each step, and if it returns a truthy value, execution halts
 *    immediately.
 *
 * The break condition function checks the following:
 *
 * 1. In the output, values at even indexes must be `0` and odd indexes must be
 *    `1`. Since an instruction can output at most one value, we only need to
 *    check the last one. If it doesn't match the above pattern, we terminate
 *    the program.
 * 2. To detect an infinite loop, we build a string that represents the current
 *    state of the VM. This string includes the instruction pointer location
 *    and the values of the registers. We store the strings in a `Set`. If ever
 *    we encounter the same string again, we know we've run into an infinite
 *    loop.
 *
 * To find the answer, we continue testing increasing values of `a` until all
 * of the following conditions are met:
 *
 * - The program terminates due to an infinite loop.
 * - The output array is not empty.
 * - The length of the output array is even.
 * - All even-indexed output values are `0` and all odd-indexed output values
 *   are `1`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const vm = assembunny(input);
  const seenStates = new Set();
  let infinite

  /**
   * Returns `true` if the VM should halt, and `false` value otherwise.
   *
   * @returns {boolean} - whether the VM should halt
   */
  const breakCondition = () => {
    const output = vm.ctx.output;

    if (output.length) {
      const i = output.length - 1;

      if (output[i] !== i % 2) {
        return true;
      }
    }

    const state = vm.ctx.pointer + JSON.stringify(vm.ctx.regs);

    if (seenStates.has(state)) {
      infinite = true
      return true;
    }

    seenStates.add(state);
    return false;
  };

  let a = 0;

  do {
    vm.reset();
    seenStates.clear();
    infinite = false
    vm.ctx.regs.a = ++a;
    vm.run(breakCondition);
  } while (
    !infinite ||
    !vm.ctx.output.length ||
    vm.ctx.output.length % 2 !== 0 ||
    vm.ctx.output.some((value, i) => value !== i % 2)
  );

  return [ a, undefined ];
};
