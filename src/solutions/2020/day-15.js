const { split } = require('../util');

const TURN_LIMITS = [ 2020, 30000000 ];

/**
 * # [Advent of Code 2020 Day 15](https://adventofcode.com/2020/day/15)
 *
 * This is a basically having you compute a
 * [Van Eck's sequence](https://oeis.org/A181391). There isn't really a way to
 * solve this apart from brute force, and it does take a little longer than
 * some of the previous solutions, but it still solves in a reasonable amount
 * of time. This one isn't as hard as some of the previous ones, but there are
 * some little things that can trip you up if you're not careful:
 * 
 * - If you try to store the last times numbers were spoken in an array, it can
 *   really slow down your solution. A `Map` works better: use the number being
 *   spoken as the key, and store under it the last turn it was spoken.
 * - It's easy to fall victim to off-by-one errors; check your logic.
 * - It's only neccessary to store the most recent time a number was spoken (as
 *   opposed to the entire history of mentions for a number), but you have to
 *   be careful to compute the next number to be spoken _before_ you overwrite
 *   the previous number's last spoken index. Otherwise, you'll just get a
 *   string of `1`s.
 * 
 * This puzzle doesn't substantially change the problem in part 2: instead of
 * providing the 2,020th number, you have to provide the 30,000,000th. If you
 * haven't done anything too slow, you can do part two with essentially no code
 * changes, although it will run slower than the solutions for previous
 * puzzles. To prevent this from delaying testing too much, the test case for
 * day 15 only tests the 2,020 answers.
 *
 * @param {string} input - the puzzle input
 * @param {number} [n] - compute the `n`th value
 * @returns {array|number} - the puzzle answers, or the `n`th value if `n` is specified
 */
module.exports = (input, n) => {
  const startingNumbers = split(input, {
    delimiter: ',',
    parseInt: true,
  });

  if (n) {
    return solve(startingNumbers, n);
  }

  return TURN_LIMITS.map(turnLimit => solve(startingNumbers, turnLimit));
};

/**
 * Finds the `n`th term in the sequence, using the given starting numbers.
 *
 * @param {Array} input - the starting numbers
 * @param {number} n
 * @returns {number} - the `n`th term
 */
const solve = (input, n) => {
  const turnLastSpoken = new Map();
  input.forEach((number, i) => {
    if (i < input.length - 1) {
      turnLastSpoken.set(number, i + 1);
    }
  });
  let lastTurn = { turn: input.length, spoken: input[input.length - 1] };

  while (lastTurn.turn < n) {
    const whenSpoken = turnLastSpoken.get(lastTurn.spoken);
    const nextNumber = typeof whenSpoken === 'undefined' ? 0 : lastTurn.turn - whenSpoken;
    turnLastSpoken.set(lastTurn.spoken, lastTurn.turn);
    lastTurn = {
      turn: lastTurn.turn + 1,
      spoken: nextNumber,
    };
  }

  return lastTurn.spoken;
};
