const { match } = require('../util');
const { mod } = require('../math2');

const DEFAULT_CONFIG = [
  {
    deckSize: 10_007n,
    cardToFind: 2019n,
  },
  {
    deckSize: 119_315_717_514_047n,
    iterations: 101_741_582_076_661n,
    indexToCheck: 2020n,
  },
];
const REGEXP = /^(?<fn>deal into new stack|cut|deal with increment)\s?(?<n>-?\d+)?$/gm;
const INSTRUCTIONS = {
  'deal into new stack': [
    () => new LinearFunction(-1n, -1n),
    m => new LinearFunction(-1n, -1n - m),
  ],
  cut: [
    (m, n) => new LinearFunction(1n, -mod(n, m)),
    (m, n) => new LinearFunction(1n, mod(n, m)),
  ],
  'deal with increment': [
    (_, n) => new LinearFunction(n, 0n),
    (m, n) => new LinearFunction(mod(modInverse(n, m), m), 0n),
  ],
};

/**
 * # [Advent of Code 2019 Day 22](https://adventofcode.com/2019/day/22)
 *
 * I freely admit that this one kicked my tail and I had to rely heavily on
 * others' work to understand how to solve this one. I did Advent of Code 2021
 * first (that being the year that I started working on the code in this
 * repository), then after beating that one I worked on 2020, and so on
 * backward. I ended up skipping this day and solving all the other ones all
 * the way back through 2015 before I finally came back and solved this one.
 *
 * Why was it so hard? Well, some other problems required me to do a little
 * math reading before I could solve it, but this one required far more
 * research than any other. Most especially helpful was the
 * [explanation posted on Spheniscine's blog at Codeforces](https://codeforces.com/blog/entry/72593)
 * and the
 * [Java solution written by Said Aspen](https://github.com/saidaspen/aoc2019/blob/master/java/src/main/java/se/saidaspen/aoc2019/day22/Day22.java).
 * I highly recommend reading over those, but I'll do my best to give a decent
 * understanding of the solution here.
 *
 * While part one is feasible to do with a brute force approach, part two
 * changes several things on you:
 *
 * 1. Your deck now has nearly 120 trillion cards, too many to represent in
 *    memory individually.
 * 2. You now have to perform over 10 quadrillion shuffle operations, which
 *    will take far too long to perform directly.
 * 3. The integers involved are too large to be accurately represented with the
 *    JavaScript `number` type.
 * 4. Instead of reporting on the location of a particular card, you must name
 *    the card at a particular index.
 *
 * So instead of simulating the cards and shuffling directly, you are required
 * to find a way to compute where cards will be after the shuffle, and you'll
 * need to use `BigInt`s to do it. The basic tactic is to collapse all the
 * instructions down into a single formula that will tell you where any card
 * is, then use that formula to solve that part of the puzzle.
 *
 * Step one (the only easy part) is to parse the input. Here I simply used my
 * existing `match()` function to grab all the shuffle instructions out of the
 * input, and coerce any number in the instruction to a `BigInt`.
 *
 * Complicating things slightly is that the JavaScript `%` operator, commonly
 * referred to as the modulo operator, is actually a remainder operator, and
 * those two things are not the same when it comes to negative numbers. For
 * example, `-8 % 7 = -1`, but `-8 mod 7 = 6`. So instead of using `%`, I use
 * the `mod()` function from my `math2` module. This function is used to bring
 * computations down to the range of the deck.
 *
 * There are three different possible shuffle operations defined in the puzzle
 * text. Let's see first how to compute the card that's in a particular
 * location after performing any one of the three shuffle operations, where `x`
 * is the target location and `m` is the deck size (the modulus):
 *
 * - _Deal into new stack:_ `m - x - 1`
 * - _Cut `n`:_ `(x - n) mod m`
 * - _Deal with increment `n`: (n * x) mod m`
 *
 * Each of these transformations can be written in the form `(a * x + b) mod m`
 * with different values for `a` and `b` for each of the operations:
 *
 * | Operation               |  `a` |  `b` |
 * | ----------------------- | ---: | ---: |
 * | Deal into new stack     | `-1` | `-1` |
 * | Cut `n`                 |  `1` | `-n` |
 * | Deal with increment `n` |  `n` |  `0` |
 *
 * I encapsulated this in a `LinearFunction` class that keeps the values of `a`
 * and `b`, and is responsible for performing operations with them that I'm
 * about to describe. When I parse the shuffle instructions, each instruction
 * is represented by a `LinearFunction`. Remember that all the math has to be
 * done using `BigInt`s.
 *
 * When you have two linear functions to perform one after the other, you can
 * _compose_ them together to make one new linear function that represents the
 * result of executing the two original functions. If the `a` and `b` values
 * from the two input functions are named `a1`, `b1`, `a2`, and `b2`, the new
 * `a` and `b` values can be computed like this:
 *
 * - `a = a1 * a2`
 * - `b = b1 * a2 + b2`
 *
 * The `compose()` method on `LinearFunction` composes one `LinearFunction`
 * with another and returns a new `LinearFunction` that represents their
 * composition. So now we can iterate the `LinearFunction`s that represent the
 * instructions and `compose()` them together to make a single `LinearFunction`
 * that represents the result of executing all the shuffle instructions.
 *
 * I also created an `apply()` method on the `LinearFunction` which accepts the
 * target value `x` and the deck size `m` and returns the result of executing
 * the function. Calling `apply()` on the composed `LinearFunction` and passing
 * in 2019 and 10,007 as specified in the puzzle text is enough to solve part
 * one.
 *
 * Now we get back to the complications introduces by part two. The big numbers
 * aren't a problem now, since we've been using `BigInt`s from the start.
 * However, it will take far too long to call our composed `LinearFunction`
 * over 100 trillion times. It turns out, you can compute a `LinearFunction`
 * that represents `n` executions of that function. I won't get into the
 * math; see the links above if you want a detailed explanation. I wrote a
 * `repeat()` method on `LinearFunction` which performs this. It's similar to
 * the one implemented in Java by Said Aspen (linked above), but uses some
 * iteration instead of a full recursive solution to avoid blowing the call
 * stack.
 *
 * The last issue is that for part two, we want the card at a particular
 * location rather than the location of a particular card. In other words, we
 * want the inverse of what we were doing in part one. This is resolved by
 * reversing the order of the instructions, and creating new `LinearFunction`s
 * for the three shuffle operations that are the inverse of the existing ones.
 * However, the "deal with increment `n`" instruction requires you to perform
 * a [modular multiplicative inverse](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse)
 * operation, so that had to be implemented, too.
 *
 * With all of that in place, it's now possible to solve part two: Reverse the
 * list of instructions, compose them together using the inverted
 * `LinearFunction`s, use `repeat()` to create a new `LinearFunction` that
 * represents repeating the shuffle 101,741,582,076,661 times, then compute the
 * card at position 2020 in a deck of 119,315,717,514,047 cards by passing
 * those values into `apply()` to get the answer to part two. Whew!
 *
 * For testing, I made it so that I could pass in a configuration object that
 * can be used to specify the exact scenario I want to use with the given
 * instructions, including the deck size, number of iterations to perform the
 * shuffles, whether I want the position of a card or the card in a particular
 * position (part 1 or part 2), and what card or position is being sought. I
 * tested each shuffle operation alone, then the examples in the puzzle text.
 * Then I tested repeating the "deal into new stack" operation twice to ensure
 * that I end up with the cards back in their original order.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, config) => {
  const instructions = parse(input);
  const parts = [ part1, part2 ];

  if (config) {
    return parts[config.part - 1](instructions, config);
  }

  return DEFAULT_CONFIG.map((config, i) => parts[i](instructions, config));
};

/**
 * Returns an array of objects representing the shuffle instructions in the
 * puzzle input. Each object has two properties:
 *
 * - `op` (`Array<LinearFunction>`): The `LinearFunction`s that represent
 *   performing this shuffle operation forward (element `0`) or backward
 *   (element `1`).
 * - `n` (`number`|`undefined`): The numeric argument for this operation, if
 *   present.
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Object>} - the parsed instruciton objects
 */
const parse = input => match(input, REGEXP, ({ fn, n }) => ({
  op: INSTRUCTIONS[fn],
  n: n === undefined ? undefined : BigInt(n),
}));

/**
 * Solves part one of the puzzle.
 *
 * @param {Array<Object>} instructions - the parsed instruction objects
 * @param {Object} config - shuffle configuration
 * @param {number} config.deckSize - the number of cards in the deck
 * @param {number} config.cardToFind - the number of the card to locate
 * @returns {number} - the location of the indicated card
 */
const part1 = (instructions, { deckSize, cardToFind }) => {
  const shuffle = buildShuffle(instructions, deckSize, 0);
  return shuffle.apply(cardToFind, deckSize);
};

/**
 * Solves part two of the puzzle.
 *
 * @param {Array<Object>} instructions - the parsed instruction objects
 * @param {Object} config - shuffle configuration
 * @param {number} config.deckSize - the number of cards in the deck
 * @param {number} config.iterations - the number of times to perform the
 * shuffle operations
 * @param {number} config.indexToCheck - the index to report on
 * @returns {number} - the card at the indicated index
 */
const part2 = (instructions, { deckSize, iterations, indexToCheck }) => {
  const shuffle = buildShuffle(instructions, deckSize, 1);
  const repeatedShuffle = shuffle.repeat(iterations, deckSize);
  return repeatedShuffle.apply(indexToCheck, deckSize);
};

/**
 * Performs the modular multiplicative inverse. It is the number `a^-1` such
 * that `(a * a^-1) mod m = 1`.
 *
 * @param {number} a 
 * @param {number} m 
 * @returns {number}
 */
const modInverse = (a, m) => {
  let t = 0n, newT = 1n, r = m, newR = a;

  while (newR !== 0n) {
    const quotient = r / newR;
    [ t, newT ] = [ newT, t - quotient * newT ];
    [ r, newR ] = [ newR, r - quotient * newR ];
  }

  if (r > 1n) {
    return NaN;
  }

  return t < 0n ? t + m : t
};

/**
 * Composes the instructions together into a single `LinearFunction`.
 *
 * @param {Array<Object>} instructions - the instruction objects
 * @param {number} deckSize - the number of cards in the deck
 * @param {number} direction - `0` for forward, `1` for backward
 * @returns {LinearFunction} - the `LinearFunction` to perform the shuffle
 */
const buildShuffle = (instructions, deckSize, direction) => {
  if (direction === 1) {
    instructions = [ ...instructions ].reverse();
  }

  return instructions.reduce(
    (lf1, { op, n }) => lf1.compose(op[direction](deckSize, n)),
    LinearFunction.IDENTITY
  );
};

/**
 * Represents a linear function and handles various operations performed with
 * it.
 */
class LinearFunction {
  #a;
  #b;

  /**
   * Creates a new `LinearFunction` with the given `a` and `b` values.
   *
   * @param {*} a 
   * @param {*} b 
   */
  constructor(a , b) {
    this.#a = a;
    this.#b = b;
  }

  /**
   * Executes the function with the given input value and modulus.
   *
   * @param {number} x - input value
   * @param {number} m - modulus (deck size)
   * @returns 
   */
  apply(x, m) {
    return mod(x * this.#a + this.#b, m);
  }

  /**
   * Composes this `LinearFunction` with another.
   *
   * @param {LinearFunction} that - the other `LinearFunction`
   * @returns {LinearFunction} - the composed `LinearFunction`
   */
  compose(that) {
    const result = new LinearFunction(
      this.#a * that.#a,
      this.#b * that.#a + that.#b
    );
    return result;
  }

  /**
   * Creates a new `LinearFunction` which constitutes the repetition of this
   * `LinearFunction` `n` times.
   *
   * @param {number} n - the number of times to repeat the function
   * @param {number} m - the modulus (deck size)
   * @returns {LinearFunction} - the resulting `LinearFunction`
   */
  repeat(n, m) {
    const { a, b } = repeatFn(this.#a, this.#b, n, m);
    return new LinearFunction(a, b);
  }
}

/**
 * A no-shuffle `LinearFunction`.
 */
LinearFunction.IDENTITY = new LinearFunction(1n, 0n);

/**
 * Hybrid iterative and recursive implementation of `LinearFunction.repeat()`.
 * Based on Said Aspen's Java implementation, but modified to reduce the amount
 * of recursion so as to avoid blowing the stack.
 *
 * @param {number} a - linear function `a` value
 * @param {number} b - linear function `b` value
 * @param {number} n - number of repetitions
 * @param {number} m - modulus (deck size)
 * @returns {Object} - the `a` and `b` values of the resulting linear function
 */
const repeatFn = (a, b, n, m) => {
  if (n === 0n) {
    return { a: 0, b: 1, n: 0 };
  }

  let next = { a, b, n };

  while (next.n !== 1n) {
    if (next.n === 1n) {
      return next;
    }

    const a2 = mod(next.a * next.a, m);
    const b2 = mod(next.a * next.b + next.b, m);

    if (mod(next.n, 2n) === 0n) {
      next = { a: a2, b: b2, n: next.n / 2n };
      continue;
    }

    const cd = repeatFn(next.a, next.b, next.n - 1n, m);
    next = {
      a: mod(next.a * cd.a, m),
      b: mod(next.a * cd.b + next.b, m),
      n: cd.n,
    };
  }

  return next;
};
