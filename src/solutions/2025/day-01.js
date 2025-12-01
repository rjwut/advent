const { split } = require('../util');

const STARTS_AT = 50;
const LIMIT = 100;

/**
 * # [Advent of Code 2025 Day 1](https://adventofcode.com/2025/day/1)
 *
 * Part 1 requires us to count how many times we stop at 0 as we follow the instructions for opening
 * a combination lock. Part 2 asks us to count how many times we _pass_ 0. As noted, unlike normal
 * combination locks, any one step may require us to rotate the dial more than one complete
 * revolution, potentially passing 0 multiple times.
 *
 * Let's start with figuring out what number we end up at after each turn so we can compute how many
 * times we end up at `0`, and ignore counting the times we pass zero for now. Left turns can be
 * represented as negative numbers (e.g. L12 = -12) and right turns as positive numbers (e.g. R34 =
 * 34). This simplifies the logic later, since we can simply add the number to our current position.
 *
 * Next, we produce a _normalized turn_, which is the smallest positive value that results in the
 * same final position on the dial. For example, for turn of L270, the normalized turn is R30. We
 * can compute the new position as:
 *
 * ```txt
 * pos = (pos + (turn % 100) + 100) % 100
 * ```
 *
 * Performing this procedure for each turn, counting the number of times we end up at `0` after each
 * turn, produces the answer to part 1.
 *
 * Now let's figure out how many times we _pass_ `0`. For each turn, we do the following:
 *
 * 1. Compute the absolute turn distance.
 * 2. Compute the distance from our current position to `0` in the direction of the turn.
 * 3. If the absolute turn distance is less than the distance to `0`, we don't pass `0` this turn,
 *    so skip to the next one.
 * 4. Otherwise, compute how many times we pass (or land on `0`) this turn:
 *    1. Subtact the distance to `0` from the absolute turn distance, then divide by `100`,
 *       truncating any fractional part.
 *    2. Unless we started the turn at `0`, add `1` to account for the first time we pass `0`
 *       (before we made a full turn).
 * 5. Sum the number of times we passed `0` for each turn to get the answer to part 2.
 *
 * Both parts of the puzzle can be solved in a single pass.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const turns = split(
    input
      .replaceAll('L', '-')
      .replaceAll('R', ''),
    { parseInt: true });
  let pos = STARTS_AT, passesZeroTimes = 0, stopsAtZeroTimes = 0;
  turns.forEach(turn => {
    const absTurn = Math.abs(turn);
    const distanceToZero = (turn < 0 ? pos : LIMIT - pos) % LIMIT;

    if (absTurn >= distanceToZero) {
      passesZeroTimes += Math.floor((absTurn - distanceToZero) / LIMIT) + (pos === 0 ? 0 : 1);
    }

    pos = (pos + (turn % LIMIT) + LIMIT) % LIMIT;

    if (pos === 0) {
      stopsAtZeroTimes++;
    }
  })
  return [ stopsAtZeroTimes, passesZeroTimes ];
};
