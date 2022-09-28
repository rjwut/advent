const duetVm = require('./duetvm');
const { split } = require('../util');
const { isPrime } = require('../math2');

/**
 * # [Advent of Code 2017 Day 23](https://adventofcode.com/2017/day/23)
 *
 * Part one is easy: we just reuse the [Duet VM](duetvm.js) we built for
 * [Day 18](day18.js), add in the new operations and the ability to count how
 * many times an operation is executed, then run it and return the execution
 * count for `mul`.
 *
 * The Duet VM is going to be too slow to be useful for part two. Instead, we
 * have to read the machine code and figure out what the program does. It turns
 * out that it is iterating over every 17th value in a range of numbers, and
 * counting the number of composite (non-prime) numbers it encounters. I can
 * easily write something in JavaScript that will be much more efficient than
 * the Duet VM. However, I want my solution to work for everyone's inputs, not
 * just mine. Otherwise, I might as well write part two to just return the
 * answer!
 * [Reddit](https://www.reddit.com/r/adventofcode/comments/7lms6p/2017_day_23_solutions/)
 * says that the only thing that varies in the inputs is the value set to
 * register `b` on the first line, which is used to determine the limits of the
 * range of numbers to check, so I'll parse that out and use it. I also added
 * an `isPrime()` function to my `math2` library.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ part1, part2 ].map(fn => fn(input));

/**
 * Compute the answer for part one.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the answer for part one
 */
const part1 = input => {
  const vm = duetVm(input);
  vm.run();
  return vm.getInstructionCount('mul');
};

/**
 * Compute the answer for part two.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the answer for part two
 */
const part2 = input => {
  const lines = split(input);
  const b = parseInt(lines[0].split(' ')[2], 10);
  const min = b * 100 + 100_000;
  const max = min + 17_000;
  let count = 0;

  for (let n = min; n <= max; n += 17) {
    if (!isPrime(n)) {
      count++;
    }
  }

  return count;
};
