const makePatternIterators = require('./day-16-pattern-iterator');

const MESSAGE_LENGTH = 8;
const REPEAT_TIMES = 10_000;

/**
 * # [Advent of Code 2019 Day 16](https://adventofcode.com/2019/day/16)
 *
 * It's helpful to restate the problem using a different representation, where
 * all the patterns for each offset are laid out in a grid, like this:
 *
 * ```
 *  1  2  3  4  5  6  7  8 |
 * ------------------------+---
 *  1  0 -1  0  1  0 -1  0 | 4
 *  0  1  1  0  0 -1 -1  0 | 8
 *  0  0  1  1  1  0  0  0 | 2
 *  0  0  0  1  1  1  1  0 | 2
 *  0  0  0  0  1  1  1  1 | 6
 *  0  0  0  0  0  1  1  1 | 1
 *  0  0  0  0  0  0  1  1 | 5
 *  0  0  0  0  0  0  0  1 | 8
 * ```
 *
 * The input digits are along the top, while the output digits are along the
 * right side. For each row, you mutiply the pattern value with the input digit
 * above it. Then you sum the results for the row, and put the ones digit of
 * the answer in the output digit slot.
 *
 * This procedure can be brute-forced just fine for part one, but in part two,
 * we're given a gigantic signal (input) to start with, and we're expected to
 * determine eight consecutive digits found at a specified part of the signal.
 * There are several things we can note that can help us do this without having
 * to resort to brute force:
 *
 * 1. For output digit `n`, we can ignore the first `n` digits of the signal in
 *    our computation, since the pattern digits are all `0`s.
 * 2. Once `n` reaches half the length of the signal, the pattern values after
 *    the first `n` are `1`s.
 * 3. The offset specified is always in the latter half of our expanded signal.
 * 4. Because the pattern values are all `1`s for the digits we care about, we
 *    can ignore the multiplication entirely and just sum the digits from right
 *    to left.
 *
 * Suppose we wanted to compute four digits at offset `4`. Since the offset
 * occurs at or after the halfway point of the signal, all signal digits that
 * occur before the offset can be ignored, and we can assume that all the rest
 * are `1`s. Computing the output is as follows, then:
 *
 * - `n=7`: The input digit is `8`, which is just output unchanged.
 * - `n=6`: The input digit is `7`, which we add to `8` to get `15`. We then
 *          output the ones digit to get `5`.
 * - `n=5`: The input digit is `6`, which we add to `5` to get `11`. We then
 *          output the ones digit to get `1`.
 * - `n=4`: The input digit is `5`, which we add to `1` to get `6`, which is
 *          our output digit.
 *
 * The output after one phase is `6158`. Let's repeat for another phase:
 *
 * - `n=7`: The input digit is `8`, which is again unchanged.
 * - `n=6`: The input digit is `5`, which we add to `8` to get `13`. We then
 *          output the ones digit to get `3`.
 * - `n=5`: The input digit is `1`, which we add to `3` to get `4`.
 * - `n=4`: The input digit is `6`, which we add to `4` to get `10`. We then
 *          output the ones digit to get `0`.
 *
 * The output after two phases is `0438`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part, phases = 100) => {
  input = input.trim();
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](input, phases);
  }

  return parts.map(fn => fn(input, phases));
};

const part1 = (input, phases) => {
  let signal = parse(input);

  for (let i = 0; i < phases; i++) {
    signal = stepPhase(signal);
  }

  return signal.slice(0, MESSAGE_LENGTH).join('');
};

const part2 = (input, phases) => {
  const offset = parseInt(input.substring(0, 7), 10);
  const signal = parse(input.repeat(REPEAT_TIMES).substring(offset));

  for (let i = 0; i < phases; i++) {
    let sum = 0;

    for (let j = signal.length - 1; j >= 0; j--) {
      sum = (sum + signal[j]) % 10;
      signal[j] = sum;
    }
  }

  return signal.slice(0, MESSAGE_LENGTH).join('');
};

const stepPhase = signal => {
  const patternIterators = makePatternIterators(signal.length);
  const messageOut = new Array(signal.length);

  for (let i = 0; i < messageOut.length; i++) {
    const patternIterator = patternIterators[i];
    let sum = 0;

    for (let j = 0; j < signal.length; j++) {
      const signalValue = signal[j];
      const patternValue = patternIterator.next().value;
      sum += signalValue * patternValue;
    }

    messageOut[i] = Math.abs(sum) % 10;
  }

  return messageOut;
};

const parse = input => {
  return [ ...input.trim() ].map(number => parseInt(number, 10));
};
