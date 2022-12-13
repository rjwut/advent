const IntcodeVm = require('./intcode');

const TARGET_OUTPUT = 19690720;

/**
 * This puzzle provides us with an "Intcode" program, which is a
 * comma-delimited list of integers. Each integer can be either an opcode, a
 * value, or an address. Each opcode can be followed by parameters; how many
 * parameters it has depends on the opcode.
 *
 * The program is executed as follows:
 *
 * 1. Start the instruction pointer at position `0`.
 * 2. Read the integer at the pointer (called the opcode).
 * 3. Read as many of the following integers as needed by the opcode for
 *    parameters.
 * 4. Move the instruction pointer to the position after the last parameter.
 * 5. Act according to the opcode:
 *    - `1`: Read the values at the addresses listed in parameters 0 and 1, add
 *      them together, and store the result at the address listed in parameter
 *      2.
 *    - `2`: Same as `1`, but multiply instead of adding.
 *    - `99`: Terminate normally.
 *    - other: Terminate with an error.
 * 6. If the program hasn't terminated, go to step 2.
 *
 * The program may be provided with a `noun` value and a `verb` value. If so,
 * they must be stored at positions `1` and `2`, respectively, before executing
 * the program.
 *
 * Part one asks us to execute the program as described above using the input
 * values `12` and `2`, and report output when the program terminates. Part two
 * asks us to find the input values that cause the program to output
 * `19690720`. The possible input values range from `0` to `99`, inclusive.
 * Brute force works just fine, so we just try all combinations until we find
 * the one that works.
 *
 * Since multiple puzzles in 2019 use the Intcode interpreter, I broke it off
 * into a separate own module with its own tests.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ part1, part2 ].map(fn => fn(input));

/**
 * Run part one of the puzzle: execute the program with `12` for the noun and
 * `2` for the verb, and report the value at position `0` when the program
 * terminates.
 *
 * @param {Array} program - the Intcode program
 * @returns {number} - the value at position `0`
 */
const part1 = program => {
  const vm = new IntcodeVm();
  vm.load(program);
  vm.program.write(1, 12);
  vm.program.write(2, 2);
  vm.run();
  return vm.program.read(0);
};

/**
 * Determines the input values that produce the `TARGET_OUTPUT` value, then
 * concatenates and returns them. For this part, debug mode results in the
 * return value always being `undefined`.
 *
 * @param {Array} program - the Intcode program
 * @param {boolean} [debug=false] - whether to turn on debug mode
 * @returns {string} - the concatenated inputs that produced the target output
 */
const part2 = (program, debug) => {
  if (debug) {
    return undefined;
  }

  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      const vm = new IntcodeVm();
      vm.load(program);
      vm.program.write(1, noun);
      vm.program.write(2, verb);
      vm.run();

      if (vm.program.read(0) === TARGET_OUTPUT) {
        return 100 * noun + verb;
      }
    }
  }
};
