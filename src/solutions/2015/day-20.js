const { factor } = require('../math2');

const RULES = [
  { maxVisits: Infinity, presentMultiplier: 10 },
  { maxVisits: 50, presentMultiplier: 11 },
];

/**
 * # [Advent of Code 2015 Day 20](https://adventofcode.com/2015/day/20)
 *
 * The difference between the two parts are:
 *
 * | Part | Visits/elf | Multiplier |
 * | ---: | ---------: | ---------: |
 * |    1 |   Infinity |         10 |
 * |    2 |         50 |         11 |
 *
 * At any given house, you can determine which elves visited it by factoring
 * the house number. For example, in part one, house 54 is visited by elves 1,
 * 2, 3, 6, 9, 18, 27, and 54. In part two, however, elf 1 doesn't visit that
 * house because by that time they've already visited 50 houses. So for part
 * two, before considering an elf, we make sure that the elf's number times the
 * visits per elf does not exceed the house number. By setting the visits per
 * elf in part one to `Infinity`, we can treat both parts the same.
 *
 * Once we know which elves visited a house, we multiply each elf's number with
 * the present multiplier for that part (10 for part one, 11 for part two),
 * then sum the results to get the number of presents delivered to that house.
 * If that number equals or exceeds the input value, that house is the answer
 * for the corresponding part.
 *
 * I compute both parts simultaneously so as to only have to make one pass
 * through the houses.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const minPresents = parseInt(input.trim(), 10);
  const answers = [ undefined, undefined ];
  let house = 1;

  do {
    // Which elves visited for part one?
    const elves = factor(house);

    // Iterate the elves
    const presents = elves.reduce((totals, elf) => {
      // Iterate the two puzzle parts
      RULES.forEach(({ maxVisits, presentMultiplier }, i) => {
        // Make sure the elf didn't max out their visits in part two
        if (elf * maxVisits >= house) {
          // Deliver the presents
          totals[i] += elf * presentMultiplier;
        }
      });
      return totals;
    }, [ 0, 0 ]);
    presents.forEach((count, i) => {
      // Is this the first time the present count has hit or passed the target?
      // If so, that house number is the answer to this part.
      if (!answers[i] && count >= minPresents) {
        answers[i] = house;
      }
    });
    house++;
  } while (!answers[0] || !answers[1]); // Keep going until we have two answers

  return answers;
};
