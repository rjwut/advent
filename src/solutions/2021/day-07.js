const { split } = require('../util');

// Fuel costs for each part
const COST_FUNCTION = [
  n => n,
  n => n * (n + 1) / 2,
];

/**
 * # [Advent of Code 2021 Day 7](https://adventofcode.com/2021/day/7)
 *
 * To solve this puzzle, I first compute the minimum and maximum horizontal
 * submarine positions. The target location requiring the least amount of fuel
 * must be within that range. Then I iterate the positions within that range,
 * and compute the fuel required for all the crabs to reach that position, and
 * return the minimum value.
 * 
 * The aspect of the puzzle that is different for the two parts is the fuel
 * cost function, which accepts a distance traveled (`d`) and returns the
 * amount of fuel spent to travel that far (`f`). For part one, it's simply
 * `f = d`. For part two, it's `f = d * (d + 1) / 2`
 * ([Gauss's formula](https://nrich.maths.org/2478)).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const positions = split(input, { delimiter: ',', parseInt: true });
  return COST_FUNCTION.map(fn => computeMinimumFuel(positions, fn));
};

/**
 * Computes the minimum fuel required to get all the crabs to the same
 * horizontal position.
 *
 * @param {Array} positions - the horizontal positions of the crabs
 * @param {Function} costFunction - a function that computes the fuel cost to
 * move a given distance
 * @returns {number} - the minimum fuel required
 */
const computeMinimumFuel = (positions, costFunction) => {
  const min = Math.min(...positions);
  const max = Math.max(...positions);
  let minFuel = Infinity;

  for (let i = min; i <= max; i++) {
    const fuel = computeFuelForPosition(positions, i, costFunction);

    if (fuel < minFuel) {
      minFuel = fuel;
    }
  }

  return minFuel;
};

/**
 * Computes the amount of fuel required for all crabs to move to the given
 * position.
 *
 * @param {Array} positions - the horizontal positions of the crabs
 * @param {number} target - the target horizontal position
 * @param {Function} costFunction - a function that computes the fuel cost to
 * move a given distance
 * @returns {number} - the required amount of fuel
 */
const computeFuelForPosition = (positions, target, costFunction) => {
  return positions.reduce((fuel, position) => {
    fuel += costFunction(Math.abs(position - target));
    return fuel;
  }, 0);
};
