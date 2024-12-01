const INTEGERS_REGEXP = /\d+/g;

/**
 * # [Advent of Code 2024 Day 1](https://adventofcode.com/2024/day/1)
 *
 * I used a regular expression to extract all integers from the input string, coerced them to
 * numbers, and split them into two lists. I sorted each list, since that was important for part
 * one and wouldn't negatively affect part two. For part one, I just iterated them and summed the
 * absolute values of the differences of the values at each index. For part two, I used a `Map` to
 * count the occurrences of each number in the right list, then iterated the left list and summed
 * the product of each number and its count in the right list. The only small issue I ran into and
 * quickly resolved was forgetting to use `?? 0` to default to `0` when the left list contained a
 * number that wasn't present in the right list.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  // Extract the integers from the input and split them into two lists.
  const lists = input.match(INTEGERS_REGEXP)
    .map(Number)
    .reduce((acc, n, i) => {
      acc[i % 2].push(n);
      return acc;
    }, [ [], [] ]);
  lists.forEach(list => {
    list.sort();
  });
  // Compute answer to each part
  return [ part1, part2 ].map(fn => fn(lists));
};

/**
 * Compute the answer for part 1: sum the differences between the values at each index.
 *
 * @param {number[][]} lists - the two lists
 * @returns {number} - the answer
 */
const part1 = lists => {
  const length = lists[0].length;
  let sum = 0;

  for (let i = 0; i < length; i++) {
    sum += Math.abs(lists[0][i] - lists[1][i]);
  }

  return sum;
};

/**
 * Compute the answer for part 2: sum the product of each number and the number of times it occurs
 * in the right list.
 *
 * @param {number[][]} lists - the two lists
 * @returns {number} - the answer
 */
const part2 = ([ left, right ]) => {
  // Count occurrences in the right list
  const counts = new Map();
  right.forEach(n => {
    counts.set(n, (counts.get(n) ?? 0) + 1);
  });
  // Now compute the answer
  return left.reduce(
    (acc, n) => acc + n * (counts.get(n) ?? 0),
    0
  );
};
