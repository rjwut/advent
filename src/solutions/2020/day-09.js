const { split } = require('../util');

/**
 * # [Advent of Code 2020 Day 9](https://adventofcode.com/2020/day/9)
 *
 * The day 9 puzzle has an example that has a parameter (the preamble size)
 * which differs for the example input versus the real input. To handle this,
 * my exported function has an extra `preambleSize` parameter that defaults to
 * 25, but which the test code overrides to 5.
 *
 * This puzzle has you processing an array of integers and finding the one
 * value that does not follow the pattern, which is that there are no two
 * values in the previous `preambleSize` values in the list that sum to that
 * value. Part one requires you to give that value, which is returned by
 * `findTargetValue()` in my code. Part two requires you to find a contiguous
 * set of at least two values that sum to the value from part one, sum the
 * minimum and maximum values in that set, and return the result; this is
 * performed by `findWeakness()`.
 *
 * To support `findTargetValue()`, I wrote a function called `findSum()` which
 * accepts an array of values and a desired sum, and returns `true` if any pair
 * of numbers from those values add up to the sum. The `findTargetValue()`
 * function can then simply iterate all the values after the initial preamble,
 * `slice()` an array representing the preamble for that value, and feed the
 * value and its preamble into `findSum()`. When `findSum()` returns `false`,
 * we have found the solution to part one.
 *
 * A brute force solution for part two would take too long, but there are a
 * couple of things we can notice that will help us break the problem down into
 * smaller chunks:
 *
 * 1. All the numbers are positive, so no value that is greater than or equal
 *    to the target value can be in the set we are searching for.
 * 2. Since the set of numbers we're searching for is contiguous, we can break
 *    the array into chunks at these larger values, and drop any chunks that
 *    have less than two values in them.
 *
 * The `chunkInput()` function breaks the input array into chunks according to
 * the above rules and returns them. To search a chunk for a set of contiguous
 * numbers that add up to our target value, we iterate the numbers in the
 * chunk. For each one, we start with that value and add the subsequent values
 * one by one. If the sum hits our target value, we've found the set we're
 * looking for. If it exceeds the target value, we can stop and iterate our
 * starting point. This logic is implemented by `scanChunk()`.
 *
 * To find our solution to part two, we find the chunk for which `scanChunk()`
 * returns `true`, then grab its mininum and maximum values and add them
 * together.
 *
 * @param {string} input - the puzzle input
 * @param {number} [preambleSize] - how many numbers are in the preamble
 *   (defaults to 25)
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, preambleSize = 25) => {
  input = split(input, { parseInt: true });
  const target = findTargetValue(input, preambleSize);
  return [ target, findWeakness(input, target) ];
};

/**
 * Finds the number that does not conform to the pattern described in part one
 * of the puzzle.
 *
 * @param {Array} input - the input numbers
 * @param {number} preambleSize - the size of the preamble
 * @returns {number} - the number that does not conform to the pattern
 */
const findTargetValue = (input, preambleSize) => {
  for (let i = preambleSize; i < input.length; i++) {
    const sum = input[i];

    if (!findSum(input.slice(i - preambleSize, i), sum)) {
      return sum;
    }
  }
};

/**
 * Finds the contiguous set of values from `input` that sums to `target`. Then
 * the minimum and maximum values from that set are summed and returned.
 *
 * @param {Array} input - the values to search
 * @param {number} target
 * @param
 */
const findWeakness = (input, target) => {
  const chunks = chunkInput(input, target);
  let set;

  for (let i = 0; !set && i < chunks.length; i++) {
    const chunk = chunks[i];
    set = scanChunk(chunk, target);
  }

  return Math.min(...set) + Math.max(...set);
};

/**
 * Since the numbers are all positive, no value that is greater than or equal
 * to the target value can be in the set we are searching for. And since the
 * set must be contiguous, we can break the input array in to smaller arrays to
 * reduce the search space.
 *
 * @param {Array} input - the input values 
 * @param {number} target - the target sum
 * @returns {Array} - the chunks of the input array
 */
const chunkInput = (input, target) => {
  const chunks = [];
  let chunkStart = 0;

  for (let i = 0; i <= input.length; i++) {
    const value = input[i];

    if (typeof value === 'undefined' || value >= target) {
      if (i - chunkStart >= 2) {
        chunks.push(input.slice(chunkStart, i));
      }

      chunkStart = i + 1;
    }
  }

  return chunks;
};

/**
 * Scans the given array of numbers to find a sub-array with a length of at
 * least two that sums to `target`, and returns it if found.
 *
 * @param {Array} chunk - the input chunk to scan
 * @param {number} target - the target sum
 * @returns {Array}
 */
const scanChunk = (chunk, target) => {
  const iLimit = chunk.length - 2;

  for (let i = 0; i < iLimit; i++) {
    let sum = chunk[i];

    for (let j = i + 1; j < chunk.length; j++) {
      sum += chunk[j];

      if (sum === target) {
        return chunk.slice(i, j + 1);
      }

      if (sum > target) {
        break;
      }
    }
  }
}

/**
 * Computes whether any pair of numbers from `numberPool` add up to `sum`.
 *
 * @param {Array} numberPool - the numbers from which to draw terms to add
 * @param {number} sum - the desired sum
 * @returns {boolean}
 */
const findSum = (numberPool, sum) => {
  const iLimit = numberPool.length - 1;

  for (let i = 0; i < iLimit; i++) {
    const val1 = numberPool[i];

    for (let j = i + 1; j < numberPool.length; j++) {
      const val2 = numberPool[j];

      if (val1 + val2 === sum) {
        return true;
      }
    }
  }

  return false;
}
