const { add } = require('../math2');
const { split } = require('../util');

const SPAWN_CYCLE_DAYS = 7;
const MATURITY_DAYS = 2;
const MAX_DAYS = SPAWN_CYCLE_DAYS + MATURITY_DAYS;
const SIMULATION_DAYS = [ 80, 256 ];

/**
 * # [Advent of Code 2021 Day 6](https://adventofcode.com/2021/day/6)
 *
 * The population will be likely be into the trillions after 256 days, so it
 * would be inefficient to attempt to simulate each fish individually.
 * Fortunately, we don't need to do that, since all fish with the same timer
 * value are indistinguishable from one another. Instead, we can simply create
 * an array with one element for every possible timer value (`0` - `8`), and
 * set the value of each element to the number of fish with that timer value.
 * So for the input `3,4,3,1,2`, we would have the following array:
 *
 * ```js
 * // index  0  1  2  3  4  5  6  7  8
 * [         0, 1, 1, 2, 1, 0, 0, 0, 0 ]
 * ```
 *
 * Each day, we create a new array representing today's population and fill it
 * with `0`s. Then we iterate yesterday's array and run the following rules:
 *
 * 1. If the yesterday's value is `0`, do nothing.
 * 2. If the current index is `0`, add yesterday's value to the values for
 *    today's `6` and `8` indices.
 * 3. Otherwise, add yesterday's value to the value for today's index minus
 *    one.
 *
 * Continue until the specified number of days have elapsed, then return the
 * sum of all the values in the array.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const fishCounters = split(input, { delimiter: ',', parseInt: true });
  return SIMULATION_DAYS.map(days => simulate(fishCounters, days));
};

/**
 * Run the simulation for the indicated number of days, where `fishCounters` is
 * an array containing the timers for the starting fish population.
 *
 * @param {Array} fishCounters - the starting fish population
 * @param {number} simulationDays - the number of days to simulate
 * @returns {number} - the population size after the simulation ends
 */
const simulate = (fishCounters, simulationDays) => {
  // Create the starting population array
  let sim = new Array(MAX_DAYS).fill(0);
  fishCounters.forEach(days => {
    sim[days]++;
  });

  // Run the simulation
  for (let i = 0; i < simulationDays; i++) {
    let newSim = new Array(MAX_DAYS).fill(0);

    for (let j = 0; j < MAX_DAYS; j++) {
      const count = sim[j];

      if (count > 0) {
        if (j === 0) {
          // These fish are spawning; their timers get set to SPAWN_CYCLE_DAYS
          // - 1, while the new fish get timers at MAX_DAYS - 1.
          newSim[SPAWN_CYCLE_DAYS - 1] += count;
          newSim[MAX_DAYS - 1] += count;
        } else {
          // These fish aren't spanwing; decrement their timers.
          newSim[j - 1] += count;
        }
      }
    }

    sim = newSim;
  }

  return add(sim);
};
