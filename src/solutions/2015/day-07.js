const { split } = require('../util');

const OPERATIONS = [
  { // <arg>
    regexp: /^([a-z0-9]+)$/,
    apply: (get, args) => get(args[0]),
  },
  { // <arg1> AND <arg2>
    regexp: /^([a-z0-9]+) AND ([a-z0-9]+)$/,
    apply: (get, args) => get(args[0]) & get(args[1]),
  },
  { // <arg1> OR <arg2>
    regexp: /^([a-z0-9]+) OR ([a-z0-9]+)$/,
    apply: (get, args) => get(args[0]) | get(args[1]),
  },
  { // NOT <arg>
    regexp: /^NOT ([a-z0-9]+)$/,
    apply: (get, args) => ~get(args[0]) & 65535, // JavaScript numbers are signed!
  },
  { // <arg1> LSHIFT <arg2>
    regexp: /^([a-z0-9]+) LSHIFT ([a-z0-9]+)$/,
    apply: (get, args) => get(args[0]) << get(args[1]),
  },
  { // <arg1> RSHIFT <arg2>
    regexp: /^([a-z0-9]+) RSHIFT ([a-z0-9]+)$/,
    apply: (get, args) => get(args[0]) >>> get(args[1]),
  },
];

/**
 * # [Advent of Code 2015 Day 7](https://adventofcode.com/2015/day/7)
 *
 * The part to the right of the arrow in each instruction is always the name of
 * a wire to set. The left part is one of six possible operations. I created an
 * object representing each one which has a `RegExp` used to match it and
 * extract the arguments, and an `apply()` function to compute the resulting
 * value. This makes it easy to identify the operation which should be
 * performed with each line, the values to use in that operation, and the wire
 * to which the result should be applied. To avoid overwriting wire `b` in part
 * two, a wire's value is only set if it hasn't been set already.
 *
 * With the `NOT` operation, all the bits are flipped, which makes the value
 * negative, so a 16-bit mask is applied to exclude the higher bits.
 *
 * The instructions are not given in the order in which they should be
 * executed. To find the correct execution order, I determine the dependencies
 * for each wire (the other wires whose values must be known first). I then
 * start with the wires which have no dependencies, then the wires which only
 * depend on those previous wires, and so on until all the wires are set.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const instructions = sort(split(input).map(parse));
  let wires = {};
  const get = arg => typeof arg === 'number' ? arg : wires[arg];
  const execute = () => {
    instructions.forEach(instruction => {
      if (!(instruction.target in wires)) {
        wires[instruction.target] = instruction.apply(get, instruction.args);
      }
    });
  };
  execute();
  const part1 = wires.a;
  wires = { b: wires.a };
  execute();
  const part2 = wires.a;
  return [ part1, part2 ];
};

/**
 * Parses the instruction from the given line. The object has the following
 * properties:
 *
 * - `target` (`string`): The name of the wire whose value is to be set
 * - `dependencies` (`Array<string>`): The names of any wires whose values must
 *   already be set before the value of the `target` wire can be set
 * - `args` (`Array<string|number>`): The arguments used by this instruction
 * - `apply` (`Function`): The function which executes this instruction
 *
 * @param {string} line - an instruction line
 * @returns {Object} - the corresponding instruction object
 */
const parse = line => {
  const [ source, target ] = line.split(' -> ');

  for (const operation of OPERATIONS) {
    const match = source.match(operation.regexp);

    if (match) {
      const args = match.slice(1).map(arg => {
        const firstChar = arg[0];
        return firstChar >= '0' && firstChar <= '9' ? parseInt(arg, 10) : arg;
      });
      const dependencies = args.filter(arg => typeof arg === 'string');
      return { target, dependencies, args, apply: operation.apply };
    }
  }
};

/**
 * Sorts the instructions according to the order in which they should be executed.
 *
 * @param {Array<Object>} instructions - the instruction objects
 * @returns {Array<Object>} - the sorted instructions
 */
const sort = instructions => {
  const sorted = [];
  const setWires = new Set();

  do {
    for (let i = instructions.length - 1; i >= 0; i--) {
      const instruction = instructions[i];

      if (instruction.dependencies.every(wire => setWires.has(wire))) {
        // All wires used by this instruction have known values
        sorted.push(instruction);
        setWires.add(instruction.target);
        instructions.splice(i, 1);
      }
    }
  } while (instructions.length);

  return sorted;
};

