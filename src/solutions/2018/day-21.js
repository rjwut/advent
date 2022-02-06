const { parse, buildVm } = require('./elfcode');

/**
 * # [Advent of Code 2018 Day 21](https://adventofcode.com/2018/day/21)
 *
 * The problem description says that we can only control the value of register
 * `0`, which means there must be some point in the program where register `0`
 * is accessed. Turns out, there is exactly one; it happens right near the end
 * of the program:
 *
 * ```txt
 * #ip 2
 * ...
 * eqrr 1 0 5  <-- register `0` is accessed here
 * addr 5 2 2
 * seti 5 3 2
 * ```
 *
 * Note that there's no guarantee that this statement occurs in the same place
 * in your input, or that any of the registers involved are the same. My code
 * doesn't make these assumptions, but I will use my input for the explanation.
 *
 * The `eqrr` operation above compares the values of registers `0` and `1`; if
 * they are equal, register `5` gets set to `1`; otherwise, it gets set to `0`.
 * The next operation adds the values in registers `2` and `5` together and
 * stores the result in register `2`. Since register `2` is bound to the
 * instruction pointer, and we know that register `5` contains either a `0` or
 * a `1` at this point, we know what happens: if it's a `1`, the next
 * instruction is skipped and we end up outside the program, causing it to
 * terminate. Otherwise, we execute the next instruction, which sets register
 * `2` to `5`, moving the instruction pointer back up near the beginning of the
 * program.
 *
 * So the condition which will result in the program terminating is register
 * `0` being equal to register `1` at the time the instruction pointer reaches
 * the `eqrr` instruction shown above. When running the infinite loop, register
 * `0` is compared to a variety of values in register `1`. Part one wants us to
 * identify the value that will cause the program to halt after the fewest
 * number of instructions; in other words, the value in register `1` the first
 * time the comparison occurs.
 *
 * Part two wants the value that will cause the _most_ instructions to be
 * executed before the program halts. Since the program runs infinitely when
 * register `0` is set to `0`, there must be a finite number of values that
 * get tested before they start repeating. (Otherwise, there could be no
 * highest value to provide for the answer.) We can keep track of the values we
 * have seen until we see the same value again, which indicates that we've
 * started looping. The value just before that one is the answer.
 *
 * So my solution is:
 *
 * 1. Parse the program.
 * 2. Note which register is bound to the instruction pointer.
 * 3. Locate the `eqrr` instruction where `0` is one of the first two
 *    arguments and note its offset from the beginning of the program. Also
 *    note the index of the register with which register `0` is being compared
 *    (which we'll call `targetRegisterIndex`).
 * 4. Run the program until the register bound to the instruction pointer
 *    equals the `eqrr` instruction offset.
 * 5. Note the value of register `targetRegisterIndex`. This is the answer to
 *    part one.
 * 6. Store the value of register `targetRegisterIndex` in a `Set`.
 * 7. Continue running and storing values in the `Set` until the same value is
 *    seen again.
 * 8. The last value inserted in the `Set` before the repeated value occurs is
 *    the answer to part two.
 *
 * TODO This takes almost a minute to run on my machine. I could re-implement
 * the Elfcode program in JavaScript so that I could run it faster, but this
 * would increase the likelihood of my solution not working for other inputs.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const program = parse(input);
  const vm = buildVm(program);
  const offset = program.findIndex(
    instruction => instruction.op === 'eqrr' && (instruction.args[0] === 0 || instruction.args[1] === 0)
  );
  const instruction = program[offset];
  const targetRegisterIndex = instruction.args[instruction.args[0] === 0 ? 1 : 0];
  const seen = new Set();
  let lastInserted, part1, part2;

  do {
    do {
      vm.step();
    } while (vm.regs[vm.ipReg] !== offset);

    const value = vm.regs[targetRegisterIndex];

    if (part1 === undefined) {
      part1 = value;
    } else if (seen.has(value)) {
      part2 = lastInserted;
      break;
    } else {
      seen.add(value);
      lastInserted = value;
    }
  } while (true);

  return [ part1, part2 ];
};
