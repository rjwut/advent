const { split } = require('../util');

const DEFAULT_TARGET_LITERS = 150;

/**
 * # [Advent of Code 2015 Day 17](https://adventofcode.com/2015/day/17)
 *
 * Each possible combination of containers can be thought of as a binary
 * number, where each place represents a container, with a `1` in that place
 * meaning the container was filled with eggnog, and a `0` meaning it was
 * empty. Thus, every number between `0` and `2^numberOfContainers` represents
 * a possible combination.
 *
 * To determine the liters of eggnog contained in any combination of
 * containers, we simply sum the capacities of the containers corresponding to
 * `1`s in the binary representation of that combination number. We can easily
 * test a place for a `1` by creating a mask with `1 << containerIndex`,
 * applying it to the number with a bitwise `AND` operation, and testing
 * whether the result is non-zero.
 *
 * Once the liters of eggnog has been calculated for a combination, we compare
 * that against the target number of liters. If it's a match, we push the
 * number of containers used into a `combinations` array.
 *
 * When all possible combinations have been iterated, the combinations array
 * contains the number of containers used in each combination that held the
 * correct amount of eggnog. The length of this array is the answer to part
 * one.
 *
 * To get the answer to part two, we must determine the smallest value in the
 * array, then count the number of times it appears. I did this in a single
 * pass over the array with a `reduce()` operation, tracking the current lowest
 * number of containers, and how many times I've encountered it so far in the
 * array. Any time I encounter a lower number of containers, I dump the
 * previous results and start counting the number of times the new value
 * occurs. At the end, the number of occurrences is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @param {number} [targetLiters=150] - the number of liters of eggnog to store
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, targetLiters = DEFAULT_TARGET_LITERS) => {
  const containers = split(input, { parseInt: true });

  // Test every combination to see if it holds the target number of liters
  const limit = 2 ** containers.length;
  let combinations = [];

  for (let combination = 0; combination < limit; combination++) {
    let liters = 0;
    let containerCount = 0;

    for (let containerIndex = 0; containerIndex < containers.length; containerIndex++) {
      const mask = 1 << containerIndex;

      if (combination & mask) {
        liters += containers[containerIndex];
        containerCount++;
      }
    }

    if (liters === targetLiters) {
      combinations.push(containerCount);
    }
  }

  // Determine the fewest number of containers, and how many time that count
  // occurs in the list of combinations.
  const minimalCombinations = combinations.reduce(
    (best, containerCount) => {
      if (containerCount < best.containerCount) {
        return { containerCount, combinationCount: 1 };
      }

      if (containerCount === best.containerCount) {
        best.combinationCount++;
      }

      return best;
    },
    { containerCount: Infinity, combinationCount: 0 }
  ).combinationCount;
  return [
    combinations.length,
    minimalCombinations,
  ];
};
