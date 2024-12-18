const { match } = require('../util');
const { min } = require('../math2');
const Device = require('./day-17.device');

const REGISTER_REGEXP = /^Register (?<reg>.): (?<value>\d+)$/gm;

/**
 * # [Advent of Code 2024 Day 17](https://adventofcode.com/2024/day/17)
 *
 * Part one mainly exists to ensure we have a working interpreter for the programming language
 * described in the puzzles before tackling part two. The `Vm` class I've implemented for previous
 * years can, with some extension, handle this task. I wrote a custom `Parser` implementation to
 * read the syntax used by the input and provide the operation implementations, and a custom
 * `Program` to handle retrieving the operation and argument. I also added a method to the `Device`
 * class (the `Vm` subclass) to evaluate the combo operand. With these implemented, part one of the
 * puzzle is solved simply by instantiating `Device`, loading the program, setting the registers,
 * then running the program, dequeuing the output, and joining it with commas.
 *
 * A clue to how to go about our work part two: the operations stated in the puzzle text are really
 * just descriptions of bitwise operations:
 *
 * - A direct translation of the division operation for the `adv`, `bdv`, and `cdv` operations might
 *   be `trunc(A / 2^arg)`, but really it's a right bit shift operation: `A >> arg`.
 * - The `bst` and `out` operations describe computing `combo mod 8`, which is equivalent to
 *   `combo AND 7`.
 *
 * Part two requires us to reverse engineer the program we're running to find out what it actually
 * does. While the exact behavior can vary with the input, in general what it does is performs some
 * operations on the three least significant bits of the value in register A, then shifts those bits
 * off (`>>> 3`). It continues to do this until register A is `0`, at which point the program exits.
 * To determine the minimum value for register A that causes the program to generate its own source
 * code, we can think of it as searching through a tree: the root node is the value `0`, and each
 * child is one of the eight possible values that can be represented with three bits. We can execute
 * the program once for each of those eight values to produce a single output value for each. Any
 * which match the last digit of our program are put into a stack to be explored further.
 *
 * We continue in this way to generate more output values: For each value we pop off the stack, we
 * shift it three bits to the left, then try the binary values `000` through `111` in the three
 * least significant bits. The resulting values are run through the program, and any which produce
 * output that matches the end of our program are pushed onto stack. Eventually, we will encounter
 * values which produce the entire program as output; these values are stored in an array. Once the
 * stack is empty, the smallest value from the array of values we've found is the answer to part
 * two.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part of the puzzle to solve (defaults to both)
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const { program, registers } = parse(input);
  const device = new Device();
  device.load(program);
  registers.forEach(({ reg, value }) => {
    device.setRegister(reg, value);
  });
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](device, program);
  }

  return parts.map(part => part(device, program));
};

/**
 * Parses the input and extracts the register values and program source.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the register values and program source
 */
const parse = input => {
  const [ registersPart, programPart ] = input
    .replaceAll('\r', '')
    .split('\n\n');
  const program = programPart.slice(9).trim();
  const registers = match(
    registersPart,
    REGISTER_REGEXP,
    { value: Number },
  );
  return { registers, program };
};

/**
 * Solves part one.
 *
 * @param {Device} device - the object representing the handheld device
 * @returns {string} - the output of the program
 */
const part1 = device => {
  device.run();
  return device.dequeueAllOutput().join(',');
};

/**
 * Solves part two.
 *
 * @param {Device} device - the object representing the handheld device
 * @param {string} program - the program source
 * @returns {number} - the minimum value for register A that causes the program to generate its own
 * source code
 */
const part2 = (device, program) => {
  const found = [];
  const stack = [ 0n ];

  do {
    const value = stack.pop() << 3n;

    for (let i = 0n; i < 8n; i++) {
      // Compute the next value for register A, and run the program
      const a = value | i;
      device.reset();
      device.setRegister('A', a);
      device.setRegister('B', 0);
      device.setRegister('C', 0);
      device.run();
      const output = device.dequeueAllOutput().join(',');

      if (program.endsWith(output)) {
        // Progress...
        if (program === output) {
          // We found a match!
          found.push(a);
        } else {
          stack.push(a);
        }
      }
    }
  } while (stack.length);

  return min(found); // We want the smallest value that can produce the desired output
};
