const INPUT_REGEXP = /Generator A starts with (\d+)\nGenerator B starts with (\d+)/;
const DEFAULT_ARGS = {
  a: {
    factor: 16_807,
    multiple: 1,
  },
  b: {
    factor: 48_271,
    multiple: 1,
  },
};
const DIVIDEND = 2_147_483_647;
const MASK = 0xFFFF;
const ARGS = [
  {
    ...DEFAULT_ARGS,
    limit: 40_000_000,
  },
  {
    limit: 5_000_000,
    a: {
      ...DEFAULT_ARGS.a,
      multiple: 4,
    },
    b: {
      ...DEFAULT_ARGS.b,
      multiple: 8,
    },
  },
];

/**
 * # [Advent of Code 2017 Day 15](https://adventofcode.com/2017/day/15)
 *
 * A Google search on the numbers 16,807 and 48,271 shows us that we are
 * essentially creating a random number generator. Therefore, we should not
 * expect to be able to create a formula `f(n)` that will produce the `n`th
 * value in the sequence without computing `f(n-1)` first, indicating that a
 * brute force solution should be adequate.
 *
 * I wrote a `buildGenerator()` function that returns a
 * [`Generator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
 * that complies with the given arguments:
 *
 * - `arg0.factor` (number): The factor to multiply by
 * - `arg0.multiple` (number): The multiple to check against before `yield`ing
 *   a value
 * - `seed` (number): The starting value
 *
 * The arguments differ depending on which part of the puzzle we're doing and
 * whether we're producing `Generator` A or B. The `Generator`'s `next()`
 * function will return the next value in the sequence each time it is called
 * (masking it to the last 16 bits). Then all I have to do is count the number
 * of times the values produced by the `Generator`s match.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const seeds = input.match(INPUT_REGEXP).slice(1).map(Number);

  /**
   * Runs the solution for the part of the puzzle described by `args`.
   *
   * - `limit` (number): The number of values to generate
   * - `a` and `b` (Object): `Generator`-specific arguments
   *   - `factor` (number): The factor to multiply by
   *   - `multiple` (number): The multiple to check the result against
   *
   * @param {Object} args - the arguments to use for this run
   * @returns {number} - the number of matches
   */
  const run = args => {
    let genA = buildGenerator(args.a, seeds[0]);
    let genB = buildGenerator(args.b, seeds[1]);
    let count = 0;
  
    for (let i = 0; i < args.limit; i++) {
      if (genA.next().value === genB.next().value) {
        count++;
      }
    }
  
    return count;
  };

  return ARGS.map(run);
};

/**
 * Creates a new generator.
 *
 * @param {number} param0.factor - the factor to multiply by
 * @param {number} param0.multiple - the multiple to check the result against
 * @param {number} seed - the starting value 
 * @returns {Generator} - the new generator
 */
const buildGenerator = ({ factor, multiple }, seed) => {
  function* generator() {
    let prev = seed;
  
    do {
      prev = (prev * factor) % DIVIDEND;

      if (prev % multiple === 0) {
        yield prev & MASK;
      }
    } while (true);
  }

  return generator();
};
