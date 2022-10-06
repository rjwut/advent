const intcode = require('./intcode-ascii');

/**
 * # [Advent of Code 2019 Day 21](https://adventofcode.com/2019/day/21)
 *
 * For each part, I ended up just manually testing it to see what the output
 * was so that I could figure out a strategy for jumping over the holes. Then I
 * just wrote springscript program to do it. I leveraged my existing
 * `intcode-ascii` module, with a change to that I could get both the original
 * raw Intcode output and an ASCII-encoded version.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ part1, part2 ].map(fn => fn(input));

/**
 * Solves the first part of the puzzle.
 *
 * @param {string} intcodeSource - the Intcode program source
 * @returns {number} - the solution
 */
const part1 = intcodeSource => {
  return springdroid(intcodeSource)([
    'NOT B T', // T = B is hole
    'NOT T T', // T = B is ground
    'AND C T', // T = B is ground AND C is ground
    'NOT T T', // T = B is hole OR C is hole
    'AND D T', // T = (B is hole OR C is hole) AND D is ground
    'NOT A J', // J = A is hole
    'OR T J',  // J = A is hole OR ((B is hole OR C is hole) AND D is ground)
    'WALK',
  ]);
};

/**
 * Solves the second part of the puzzle.
 *
 * @param {string} intcodeSource - the Intcode program source
 * @returns {number} - the solution
 */
const part2 = intcodeSource => {
  return springdroid(intcodeSource)([
    'NOT B J', // J = B is hole
    'NOT C T', // T = C is hole
    'OR T J',  // J = B is hole OR C is hole
    'AND D J', // J = D is ground AND (B is hole OR C is hole)
    'AND H J', // J = H is ground AND D is ground AND (B is hole OR C is hole)
    'NOT A T', // T = A is hole
    'OR T J',  // J = A is hole OR (H is ground AND D is ground AND (B is hole OR C is hole))
    'RUN',
  ]);
};

/**
 * Runs the Intcode program that can parse and run a springscript program.
 *
 * @param {string} intcodeSource - the Intcode program source
 * @returns {Function} - a function that takes a springscript program and
 * executes it
 */
const springdroid = intcodeSource => {
  const { run, send } = intcode(intcodeSource, 'both');
  return program => {
    run();
    const { raw, ascii } = send(program.join('\n') + '\n');

    if (ascii.includes('Didn\'t make it across:')) {
      throw new Error(ascii);
    }

    return raw[raw.length - 1];
  };
};
