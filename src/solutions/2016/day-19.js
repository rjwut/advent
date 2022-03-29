/**
 * # [Advent of Code 2016 Day 19](https://adventofcode.com/2016/day/19)
 *
 * Part one is the most basic case of the
 * [Josephus problem](https://en.wikipedia.org/wiki/Josephus_problem).
 * [OEIS has a formula for it](https://oeis.org/A006257):
 *
 * ```txt
 * a(n) = 2*(n - 2^floor(log_2(n))) + 1
 * ```
 *
 * Part two complicates this by the elves taking presents from _across_ the
 * circle, which results in the interval shrinking by one every two turns.
 * Running this for a larger number of elves reveals a pattern, which I was
 * trying to explain in words, but I found someone else who did a better job of
 * it, so I'll just
 * [point you at their article](https://github.polettix.it/ETOOBUSY/2021/01/25/aoc2016-19-halving-josephus/).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const n = parseInt(input.trim(), 10);
  return [ part1, part2 ].map(fn => fn(n));
};

/**
 * Solves part one of the puzzle.
 *
 * @param {number} n - the number of elves
 * @returns {number} - the number of the elf that gets all the presents
 */
const part1 = n => 2 * (n - Math.pow(2, Math.floor(Math.log2(n)))) + 1;

/**
 * Solves part two of the puzzle.
 *
 * @param {number} n - the number of elves
 * @returns {number} - the number of the elf that gets all the presents
 */
const part2 = n => {
  const $u3 = 3 ** Math.floor(Math.log(n) / Math.log(3));

  if (n === $u3) {
    return n;
  }

  const threshold = Math.floor($u3 * 2);

  if (n <= threshold) {
    return n - $u3;
  }

  return (n - $u3) + (n - threshold);
};
