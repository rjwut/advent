const { multiply } = require('../math2');
const { split } = require('../util');

const MAX_JOLTAGE_DIFF = 3;
const NUMERIC_SORT = (a, b) => a - b;

/**
 * # [Advent of Code 2020 Day 10](https://adventofcode.com/2020/day/10)
 *
 * Part one is easy: we simply iterate the sorted list, compute each
 * difference, and count them up.
 *
 * Part two is trickier: we have to count **all** the combinations of values
 * from our input list that satisfy the above conditions. A brute force
 * solution will not work here, but we can break up the problem into smaller
 * chunks. Any place where there is a difference of three between adjacent
 * values in the input list is a place that we can break the list, since there
 * is only one possible combination that goes from one to the other. Once we
 * have broken the list into smaller chunks, we can solve each chunk
 * independently in much less time.
 *
 * Counting the number of combinations that exist in a chunk involves a queue
 * that keeps track of all the value chains we've found so far. We start with
 * the queue containing a single entry: an array containing the start value.
 * The processing loop looks like this:
 *
 * 1. Take an entry from the queue. Call the last value in that chain `x`.
 * 2. Look ahead in the list for all possible values `y` that could be added to
 *    the end of the chain. (Remember, `y` cannot be greater than `x + 3`.)
 * 3. For each candidate value `y` found:
 *    - If `y` is the last value in the chunk, we've reached the end of this
 *      combination; add one to our count.
 *    - Otherwise, clone the chain, append `y` to it, and add it to the queue.
 * 4. Repeat until the queue is empty.
 *
 * To make looking up potential values of `y` faster, I built a lookup table,
 * which is an array where each index contains a boolean value indicating
 * whether the value of that index is found in our input list.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input, { parseInt: true }).sort(NUMERIC_SORT);
  return [ part1, part2 ].map(fn => fn(input));
};

/**
 * Given an array containing the ratings of the adapters, computes the solution
 * to part 1 of the puzzle.
 *
 * @param {Array} adapters - the adapter ratings
 * @returns {number} - part 1 answer
 */
const part1 = adapters => {
  let joltage = 0;
  const diffs = new Array(MAX_JOLTAGE_DIFF + 1);
  diffs.fill(0);
  adapters.forEach(adapter => {
    const diff = adapter - joltage;
    diffs[diff]++;
    joltage = adapter;
  });
  return diffs[1] * (diffs[3] + 1);
};

/**
 * Given an array containing the ratings of the adapters, computes the solution
 * to part 2 of the puzzle.
 *
 * @param {Array} adapters - the adapter ratings
 * @returns {number} - part 2 answer
 */
const part2 = adapters => {
  adapters = [ 0, ...adapters ]
  const chunks = chunkInput(adapters);

  // Build lookup table for adapters
  const lookup = new Array(adapters[adapters.length - 1] + 1);
  adapters.forEach(adapter => lookup[adapter] = true);

  // Count permutations for each chunk and multiply them together
  return multiply(chunks.map(chunk => countPermutations(chunk, lookup)));
};

/**
 * Whenever we find two adjacent adapters A and B where the joltage difference
 * is MAX_JOLTAGE_DIFF, the array of adapters can be split there (since there's
 * only one way to go from A to B). This breaks up the problem into smaller
 * chunks and reduces the overall number of permutations we have to track at
 * once.
 *
 * @param {Array} adapters - the sorted adapter joltage values
 * @returns {Array} - the chunks
 */
const chunkInput = adapters => {
  const chunks = [];
  let chunkStart = 0;

  for (let i = 1; i < adapters.length; i++) {
    if (adapters[i] - adapters[i - 1] === MAX_JOLTAGE_DIFF) {
      chunks.push(adapters.slice(chunkStart, i));
      chunkStart = i;
    }
  }

  chunks.push(adapters.slice(chunkStart));
  return chunks;
};

/**
 * Count the number of permutations in the given adapter chain chunk.
 *
 * @param {Array} chunk - the adapter chain chunk 
 * @param {Array} lookup - the adapter lookup table
 * @returns {number} - permutation count
 */
const countPermutations = (chunk, lookup) => {
  if (chunk.length < 3) {
    return 1; // There's only one way to traverse a chain with length < 3.
  }

  const target = chunk[chunk.length - 1];
  let permutations = 0;
  const queue = [ [ chunk[0] ] ];

  while (queue.length) {
    const permutation = queue.shift();
    const curRating = permutation[permutation.length - 1];
    const nextRatingMin = curRating + 1;
    const nextRatingMax = Math.min(curRating + MAX_JOLTAGE_DIFF, target);

    for (let nextRating = nextRatingMin; nextRating <= nextRatingMax; nextRating++) {
      if (nextRating === target) {
        permutations++;
      } else if (lookup[nextRating]) {
        queue.push([ ...permutation, nextRating ]);
      }
    }
  }

  return permutations;
};
