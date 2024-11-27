const SimpleGrid = require('../simple-grid');
const reachable = require('./day-21.reachable');

const STEPS = [ 64, 26_501_365 ];
const A = 15_173;
const B = 30_762;
const C = 118_844;
const DENOMINATOR = 17_161;

/**
 * # [Advent of Code 2023 Day 21](https://adventofcode.com/2023/day/21)
 *
 * **WARNING: MY SOLUTION FOR TODAY'S PUZZLE ONLY WORKS FOR MY INPUT.** I will, however, explain
 * how to produce a solution that works for yours.
 *
 * A simple breadth-first search through the grid will solve part one, with one caveat: since we
 * move only in the cardinal directions, step count parity matters. Imagine that the grid is
 * painted like a chessboard, and that the starting position is a light square. On even-numbered
 * step counts, our position will always be on a light square, while on odd-number step counts, it
 * will always be on a dark square. We will have to consider this when computing how many garden
 * plots are reachable in exactly `n` steps. I handled this in my search function by keeping track
 * of the reachable positions in an array of two elements, one for even-numbered step counts and
 * one for odd-numbered step counts.
 *
 * Predicatably, part two takes far too long to compute by this method, but some observations can
 * lead us to a solution that can be produced much faster:
 *
 * 1. Both the example and real input have no rocks around the edges of the grid.
 * 2. The real input also has no rocks on the same row or column as the starting position.
 * 3. The grid is a 131x131 square, with the start position in the exact center.
 * 4. This means that the path from the start position to the edge of an adjacent grid is a
 *    straight line with no obstacles.
 * 5. This, in turn, means that we can easily predict how long it will take to reach adjacent
 *    grids: 65 steps from the center of the starting grid to an adjacent grid, 196 to cross the
 *    next grid and reach a third, and 327 to cross the third and reach the fourth.
 * 6. This means that we can produce three data points, which can then be fitted to a quadratic
 *    equation which can solve the problem for any number of steps.
 *
 * To compute these three data points, I created a 5x5 super grid, containing 25 copies of the
 * original grid. Starting at the center, I computed the number of positions reached in 64, 196,
 * and 327 steps, using the same method I used in part one. This resulted in answers of 3,859,
 * 34,324, and 95,135 reachable positions. I fed these data points into [Wolfram Alpha's quadratic
 * fit calculator](https://www.wolframalpha.com/input?i=quadratic+fit+calculator), which produced
 * the following formula:
 *
 * ```txt
 * f(x) = (15173x^2 + 30762x + 118844) / 17161
 * ```
 *
 * I hard-coded these values into my solution, and fed in 26501365 for `x` as specified in the
 * puzzle text to compute the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, steps) => {
  const grid = new SimpleGrid({ data: input });
  let start = grid.coordsOf('S');

  if (steps) {
    return reachable(grid, start, [ steps ])[0];
  }

  return [
    reachable(grid, start, [ STEPS[0] ])[0],
    (A * STEPS[1] ** 2 + B * STEPS[1] + C) / DENOMINATOR,
  ];
};
