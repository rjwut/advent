const duetVm = require('./duetvm');

/**
 * # [Advent of Code 2017 Day 18](https://adventofcode.com/2017/day/18)
 *
 * This puzzle has us implementing the "Duet VM" to run the given program. The
 * VM itself is implemented in the [`duetvm`](./duetvm.js) module. The tricksy
 * bits are:
 *
 * - Many arguments can be a number or a letter. If it's a letter, you should
 *   use the value stored in the register with that name. If an argument
 *   indicates what register will have its value set, that argument will never
 *   be a number.
 * - The `jgz` should move the instruction pointer by the second argument's
 *   value *minus one*, so that it will be at the correct location when the
 *   instruction pointer is incremented after the instruction is executed.
 * - The behavior of the `snd` and `rcv` instructions changes for part two. I
 *   handled this by adding a `version` parameter that allows you to specify
 *   which behavior you want (version 0 for the "wrong" implementation in part
 *   one, and version 1 for the "correct" implementation in part two).
 * - The `rcv` instruction is a no-op in part one if the value of the argument
 *   is `0`. This is not true in part two.
 * - In part two, `rcv` should block execution if no input is available. This
 *   means that you must not move the instruction pointer. Otherwise, when you
 *   attempt to resume execution, the pointer will no longer be at the `rcv`
 *   instruction and you won't consume the input.
 * - In part two, you will be running two VMs that are transmitting data to one
 *   another, and you will have to detect when a deadlock state occurs (where
 *   each VM is waiting for input from the other). This can be determined by
 *   giving each a chance to run (if it's not currently blocked), feeding any
 *   output to the other VM's input queue, then after processing both VMs,
 *   checking their states. If neither is `'ready'`, a deadlock has occurred.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part of the puzzle to solve
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](input);
  }

  return [ part1, part2 ].map(fn => fn(input));
};

/**
 * Runs the program according to the interpretation of the Duet VM described in
 * part one.
 *
 * @param {string} program - the Duet program to run
 * @returns {number} - the received value when `rcv` is called with a non-zero
 * value for the first time (the answer to part one)
 */
const part1 = program => {
  const vm = duetVm(program, 0);
  vm.run();
  return vm.flushOutput()[0];
};

/**
 * Runs two instances of the program according to the interpretection of the
 * Duet VM described in part two.
 *
 * @param {string} program - the Duet program to run
 * @returns {number} - the number of times that program 1 invoked `snd` (the
 * answer to part two)
 */
const part2 = program => {
  const vms = [
    duetVm(program),
    duetVm(program),
  ];
  vms[1].setReg('p', 1);
  let sndCount = 0;

  do {
    vms.forEach((vm, id) => {
      if (vm.getState() !== 'ready') {
        return;
      }

      vm.run();
      const otherId = id === 0 ? 1 : 0;
      const otherVm = vms[otherId];
      const output = vm.flushOutput();

      if (id === 1) {
        sndCount += output.length;
      }

      output.forEach(value => otherVm.input(value));
    });
  } while (vms.some(vm => vm.getState() === 'ready'));

  return sndCount;
};
