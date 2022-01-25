/**
 * # [Advent of Code 2018 Day 5](https://adventofcode.com/2018/day/5)
 *
 * I found it easiest to work with the polymer as an array of characters. For
 * both parts, we need the ability to perform the reactions on a polymer and
 * return the length of the resulting polymer. The `performReactions()` method
 * does this by iterating the polymer backwards, starting with the last two
 * units, and removing them if they are the same letter but not the same case.
 *
 * For part one, we just need to run `performReactions()` on the input polymer.
 * For part two, we have to try removing all instances of a single unit type,
 * then perform the reactions on the resulting polymer, and see which results
 * in the shortest one. By converting the entire polymer to lower case,
 * splitting it into an array, then feeding it into a `Set`, we can quickly
 * produce the list of unique unit types. We can then `reduce()` these types
 * down to the length of the shortest resulting polymer by filtering the input
 * polymer to remove each unit type, then performing the reactions on the
 * altered polymer and keeping track of the shortest length.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  const types = [ ...new Set([ ...input.toLowerCase() ]) ];
  const polymer = [ ...input ];
  return [ performReactions, findBestPolymer ].map(fn => fn(polymer, types));
};

/**
 * Performs all the reactions on the given polymer and reports the length of
 * the resulting polymer.
 *
 * @param {Array} polymer - the input polymer
 * @returns {number} - the length of the resulting polymer
 */
const performReactions = polymer => {
  polymer = [ ...polymer ];

  for (let i = polymer.length - 2; i >= 0; i--) {
    const unit1 = polymer[i];
    const unit2 = polymer[i + 1];

    if (unit1 !== unit2 && unit1.toLowerCase() === unit2.toLowerCase()) {
      polymer.splice(i, 2);

      if (i > polymer.length - 1) {
        i--;
      }
    }
  }

  return polymer.length;
};

/**
 * Tries removing each of the unit types specified in `types` from the original
 * `polymer`, then calls `performReactions()` on each result. The length of the
 * smallest output polymer is returned.
 *
 * @param {Array} polymer - the input polymer
 * @param {Array} types - the unit types to try removing 
 * @returns {number} - the length of the shortest resulting polymer
 */
const findBestPolymer = (polymer, types) => types.reduce((best, type) => {
  const upper = type.toUpperCase()
  const reduced = polymer.filter(unit => unit !== type && unit !== upper);
  const length = performReactions(reduced);
  return length < best ? length : best;
}, Infinity);
