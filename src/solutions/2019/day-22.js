const { split } = require('../util');

const DECK_SIZE_1 = 10_007n;
const DECK_SIZE_2 = 119_315_717_514_047n;
const ITERATIONS = 101_741_582_076_661n;
const INSTRUCTIONS = [
  {
    key: 'deal into new stack',
    linearFunction: () => ({ a: -1n, b: -1n }),
  },
  {
    key: 'cut',
    linearFunction: n => ({ a: 1n, b: -n }),
  },
  {
    key: 'deal with increment',
    linearFunction: n => ({ a: n, b: 0n }),
  },
];
const CARD_TO_FIND = 2019n;
const POSITION_TO_CHECK = 2020n;

/**
 * # [Advent of Code 2019 Day 22](https://adventofcode.com/2019/day/22)
 *
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const instructions = parse(input);
  const linearFunctions = instructions.map(instruction => {
    return instruction.linearFunction(instruction.arg);
  });
  return [
    part1(linearFunctions),
    part2(linearFunctions),
  ];
};

const part1 = linearFunctions => {
  const composed = compose(linearFunctions, DECK_SIZE_1);
  return (composed.a * CARD_TO_FIND + composed.b) % DECK_SIZE_1;
};

const part2 = linearFunctions => {
};

const parse = input => {
  return split(input).map(line => {
    const instruction = INSTRUCTIONS.find(i => line.startsWith(i.key));

    if (!instruction) {
      throw new Error(`Unknown instruction: ${line}`);
    }

    let arg;

    if (line !== instruction.key) {
      // We have an argument
      arg = BigInt(line.substring(instruction.key.length + 1));
    }

    return {
      ...instruction,
      arg,
    };
  });
};

const compose = (linearFunctions, deckSize) => {
  return linearFunctions.reduce((composed, fn) => {
    return {
      a: modulo(composed.a * fn.a, deckSize),
      b: modulo(composed.b * fn.a + fn.b, deckSize),
    };
  });
}

/**
 * Brings a card index into the range `[0, size)`.
 *
 * @param {number} i - the index
 * @param {number} size - the size of the deck
 * @returns {number} - the adjusted index
 */
const modulo = (i, size) => i >= 0n ? i % size : size - (-i % size);

/**
 * Performs modular exponentation: `base ** exp % modulus`.
 *
 * @param {*} base 
 * @param {*} exp 
 * @param {*} mod 
 * @returns 
 */
const modpow = (base, exp, mod) => {
  let result = 1n;

  while (exp > 0n) {
    if (modulo(exp, 2n) === 1n) {
      result = (result * base) % mod;
    }

    baseCopy = (base * base) % mod;
    exp = exp >> 1n;
  }

  return result;
};

const modMultInverse = (a, m) => {
  return modpow(a, m - 2n, m);
};
