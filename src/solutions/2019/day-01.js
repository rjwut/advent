const { add } = require('../math2');
const { split } = require('../util');

/**
 * This puzzle has us computing the amount of fuel required to launch a modular
 * spacecraft. Each module has a mass, and the fuel required to launch to
 * launch that modules is computed with the formula:
 * 
 * ```txt
 * fuel = floor(mass / 3) - 2
 * ```
 *
 * The input is a list giving the mass of each module, one per line. For part
 * one, we have to compute the sum of the fuel required for each module.
 * (Module fuel requirements are to be computed separately.) In part two, we
 * realize that when you add fuel, you increase the mass, and so must add more
 * fuel to account for that additional mass, and so on. We solve this by
 * recursively computing the additional fuel requirements until we reach a zero
 * or negative value for additional fuel.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input, { parseInt: true });
  return [ partOne, partTwo ].map(part => part(input));
};

/**
 * Solves part one of the puzzle (computing fuel for launch without considering
 * the mass of the fuel).
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the solution for part one
 */
const partOne = input => add(input.map(computeFuel));

/**
 * Solves part two of the puzzle (taking fuel mass into account when computing
 * fuel requirements for launch).
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the solution for part one
 */
 const partTwo = input => add(input.map(computeFuelRecursive));

/**
 * Computes the fuel required for the given mass, without considering the
 * additional fuel required to for the mass of that fuel.
 *
 * @param {number} mass - the mass for which to compute the fuel
 * @returns {number} - the amount of fuel
 */
const computeFuel = mass => Math.floor(mass / 3) - 2;

/**
 * Computes the fuel required for the given mass, including the fuel needed for
 * the mass of that fuel, and the fuel for the mass of THAT fuel, and so on.
 *
 * @param {number} mass - the mass for which to compute the fuel
 * @returns {number} - the amount of fuel
 */
 const computeFuelRecursive = mass => {
  const fuel = computeFuel(mass);
  return fuel > 0 ? fuel + computeFuelRecursive(fuel): 0;
};
