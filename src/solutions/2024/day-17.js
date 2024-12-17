const { match } = require('../util');
const { min } = require('../math2');
const Device = require('./day-17.device');

const REGISTER_REGEXP = /^Register (?<reg>.): (?<value>\d+)$/gm;

/**
 * # [Advent of Code 2024 Day 17](https://adventofcode.com/2024/day/17)
 *
 * @todo Describe solution
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

const parse = input => {
  const [ registersPart, programPart ] = input.replaceAll('\r', '').split('\n\n');
  const program = programPart.slice(9).trim();
  const registers = match(
    registersPart,
    REGISTER_REGEXP,
    { value: Number },
  );
  return { registers, program };
};

const part1 = device => {
  device.run();
  return device.dequeueAllOutput().join(',');
};

const part2 = (device, program) => {
  const found = [];
  const stack = [ 0n ];

  do {
    const value = stack.pop() << 3n;
    /*
    console.log();
    console.log(program);
    */

    for (let i = 0n; i < 8n; i++) {
      const a = value | i;
      device.reset();
      device.setRegister('A', a);
      device.setRegister('B', 0);
      device.setRegister('C', 0);
      device.run();
      const output = device.dequeueAllOutput().join(',');

      if (program.endsWith(output)) {
        //console.log(output.padStart(program.length, ' '));

        if (program === output) {
          found.push(a);
        } else {
          stack.push(a);
        }
      }
    }
  } while (stack.length);

  return min(found);
};
