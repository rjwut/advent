const { split } = require('../util');
/**
 * # [Advent of Code 2024 Day 22](https://adventofcode.com/2024/day/22)
 *
 * The generation of the next secret number is described in three steps, where each step performs
 * some operation, then executes a "mix" and a "prune". It turns out that all the described
 * calculations can be performed as bitwise operations:
 *
 * - "Mixing" is described as `a ^ b`, which is already a bitwise operation.
 * - "Pruning" is described as `a % 16777216`, which is equivalent to `a & 0xffffff`.
 * - Step one has us calculate `a * 64` before mixing and pruning, which is equivalent to `a << 6`.
 * - Step two has us calculate `Math.floor(a / 32)`, which is equivalent to `a >> 5`.
 * - Step three has us calculate `a * 2048`, which is equivalent to `a << 11`.
 *
 * This lets us speed up the sequence generation.
 *
 * For part two, we can speed it up by using a "sliding window," where we keep the last four
 * differences we've computed in an array, and with each new difference we push it on the end of the
 * array and drop the one at the beginning. This allows us to allocate just one array and reuse it
 * instead of performing 2000 allocations and re-computing the differences for each pair of numbers
 * multiple times.
 *
 * We can concatentate the differences into a string and use that as a `Map` key to keep track of
 * how many bananas we'd buy with that sequence of differences.  We want to ensure we only count the
 * _first_ time a sequence of differences is seen for each vendor, so we use a `Set` to keep track
 * of the keys we've already used for an individual vendor, and only add the price to our `Map` if
 * we haven't used that key yet.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input, { parseInt: true });
  const sequences = input.map(generateSequence);
  const part1 = sequences.reduce((acc, sequence) => acc + sequence[2000], 0);
  return [ part1, buyBananas(sequences) ];
};

/**
 * Generates a sequence of 2001 secret numbers starting with the given seed value.
 *
 * @param {number} n - the seed value
 * @returns {number[]} - the sequence of secret numbers
 */
const generateSequence = n => {
  const sequence = [ n ];

  for (let i = 0; i < 2000; i++) {
    n = secretFn(n);
    sequence.push(n);
  }

  return sequence;
};

/**
 * Determines the maximum number of bananas you can obtain by training a monkey as described in part
 * two of the puzzle
 *
 * @param {number[]} sequences - the previously generated secret number sequences
 * @returns {number} - the most bananas you can buy
 */
const buyBananas = sequences => {
  const bananasBought = new Map(); // keys are strings of difference sequences
  sequences.forEach(sequence => {
    const seenKeys = new Set(); // only use the first time a key is encountered for a vendor
    let prevPrice = sequence[0] % 10;
    const window = []; // use a sliding window of difference values

    for (let i = 1; i < sequence.length; i++) {
      const price = sequence[i] % 10;
      window.push(price - prevPrice);

      if (window.length === 4) {
        const key = window.join(',');

        if (!seenKeys.has(key)) {
          // First time we've seen this key; buy bananas
          seenKeys.add(key);
          bananasBought.set(key, (bananasBought.get(key) ?? 0) + price);
        }

        window.shift();
      }

      prevPrice = price;
    }
  });
  return Math.max(...bananasBought.values());
};

/**
 * Generates the next secret value from the given seed value.
 *
 * @param {number} n - the seed value
 * @returns {number} - the next secret number
 */
const secretFn = n => {
  n = ((n << 6) ^ n) & 0xffffff;
  n = ((n >> 5) ^ n) & 0xffffff;
  n = ((n << 11) ^ n) & 0xffffff;
  return n;
};
