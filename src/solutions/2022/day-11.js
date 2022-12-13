const { match } = require('../util');

const MONKEY_REGEXP = /Monkey \d+:\s+Starting items: (?<items>.+)\s+Operation: (?<operation>.+)\s+Test: divisible by (?<divisor>\d+)\s+If true: throw to monkey (?<ifTrue>\d+)\s+If false: throw to monkey (?<ifFalse>\d+)/g;
const ROUNDS = [ 20, 10_000 ];
const ADD = (v1, v2) => v1 + v2;
const MULTIPLY = (v1, v2) => v1 * v2;
const MONKEY_SORT = (m1, m2) => m2.inspectCount - m1.inspectCount;

/**
 * # [Advent of Code 2022 Day 11](https://adventofcode.com/2022/day/11)
 *
 * There are two things different between the parts:
 *
 * - The monkey business goes on for 10,000 rounds instead of just 20.
 * - The worry level isn't divided by 3 after the monkey loses interest in an item.
 *
 * This means that the worry values will spiral out of control unless we find some way to reduce
 * them without changing the answer. The solution is to first find the product of all the divisors
 * used in the monkey tests, then after executing the operation, take the modulo of the worry value
 * by this product and make the result the new worry value.
 *
 * Parsing was a bear on this one. I ultimately just made a big long RegExp to capture each monkey.
 * The `parseOperation()` function converted the operation string to a function that I could just
 * pass the worry value into to compute it. If you did this by replacing `"old"` with the current
 * worry value and then running it through `eval()`, shame on you, because `eval()` is evil. Yes,
 * it's probably harmless here since `topaz` is unlikely to introduce malicious JavaScript into his
 * puzzle input, but still...
 *
 * I could probably improve the execution time on this by cloning the monkeys instead of re-parsing
 * the input for part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => ROUNDS.map(rounds => run(input, rounds));

/**
 * Execute all the rounds of monkey business and produce the answer for this part.
 *
 * @param {string} input - the puzzle input
 * @param {number} rounds - the number of rounds to execute
 * @returns {number} - the answer for this part
 */
const run = (input, rounds) => {
  const part = rounds === ROUNDS[0] ? 1 : 2;
  const monkeys = parse(input.replaceAll('\r', ''));
  monkeys.forEach(monkey => {
    monkey.inspectCount = 0;
  });

  // Take the modulo of the worry values by this number to keep them from exploding in part two.
  const product = monkeys.reduce((p, monkey) => p *= monkey.divisor, 1);

  for (let round = 0; round < rounds; round++) {
    monkeys.forEach(monkey => {
      while (monkey.items.length) {
        // Inspect an item
        monkey.inspectCount++;
        let item = monkey.operation(monkey.items.shift());

        if (part === 1) {
          item = Math.floor(item / 3);
        } else {
          item = item % product;
        }

        const next = item % monkey.divisor === 0 ? monkey.ifTrue : monkey.ifFalse;
        monkeys[next].items.push(item);
      }
    });
  }

  // Compute monkey business value for top two monkeys.
  monkeys.sort(MONKEY_SORT);
  return monkeys[0].inspectCount * monkeys[1].inspectCount;
};

/**
 * Parse the monkeys from the input. Each monkey is an object with these properties:
 *
 * - `items` (`Array<number>`): The worry values for the items the monkey is currently holding
 * - `operation` (`Function`): The operation performed on the worry value on inspection
 * - `divisor` (`number`): The divisor to test against to determine where the item goes next
 * - `ifTrue` (`number`): The index of the recipient monkey if worry is divisible by `divisor`
 * - `ifFalse` (`number`): The index of the recipient monkey if worry isn't divisible by `divisor`
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Object>} - the monkey objects
 */
const parse = input => match(input, MONKEY_REGEXP, {
  items: str => str.split(', ').map(Number),
  operation: parseOperation,
  divisor: Number,
  ifTrue: Number,
  ifFalse: Number,
});

/**
 * Converts a monkey's operation string to a function.
 *
 * @param {string} str - the operation
 * @returns {Function} - the corresponding function
 */
const parseOperation = str => {
  let [ , , v1, op, v2 ] = str.split(' ');
  op = op === '+' ? ADD : MULTIPLY;
  return worry => op(
    v1 === 'old' ? worry : Number(v1),
    v2 === 'old' ? worry : Number(v2),
  );
};
