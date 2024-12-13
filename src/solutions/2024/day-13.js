const { match } = require('../util');

const MACHINE_REGEXP = /Button A: X\+(?<xa>\d+), Y\+(?<ya>\d+)\sButton B: X\+(?<xb>\d+), Y\+(?<yb>\d+)\sPrize: X=(?<xp>\d+), Y=(?<yp>\d+)/g;

/**
 * # [Advent of Code 2024 Day 13](https://adventofcode.com/2024/day/13)
 *
 * In order to display some nice equations in my explanation, I've written [a separate Markdown
 * document that explains my solution for this puzzle](day-13.md).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const machines = match(
    input,
    MACHINE_REGEXP,
    {
      xa: Number, ya: Number,
      xb: Number, yb: Number,
      xp: Number, yp: Number,
    }
  );
  return [ 0, 10_000_000_000_000 ].map(shift => compute(machines, shift));
};

/**
 * Computes the cost for all obtainable prizes for the given machines, after adding `shift` to the
 * X and Y coordinates of each prize. Each machine is an object with the following parameters:
 *
 * - `xa` and `ya`: The amount the claw moves on each axis when pressing button A
 * - `xb` and `yb`: The amount the claw moves on each axis when pressing button B
 * - `xp` and `yp`: The X and Y coordinates of the prize (before the shift)
 *
 * @param {Object[]} machines - the machines
 * @param {number} shift - the amount to shift the prize on each axis
 * @returns - the cost of all obtainable prizes
 */
const compute = (machines, shift) => machines.map(({ xa, ya, xb, yb, xp, yp }) => {
  xp += shift;
  yp += shift;
  const b = (xa * yp - ya * xp) / (xa * yb - ya * xb);
  const a = (xp - b * xb) / xa;
  return { a, b };
})
.filter(({ a, b }) => Number.isInteger(a) && Number.isInteger(b))
.reduce((tokens, { a, b }) => tokens + 3 * a + b, 0);
