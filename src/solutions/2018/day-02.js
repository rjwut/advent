const { split } = require('../util');

/**
 * # [Advent of Code 2018 Day 2](https://adventofcode.com/2018/day/2)
 *
 * For part one, I break each ID string into an array and use `Array.reduce()`
 * to produce a `Map` containing the counts for each letter. Then I just have
 * to take the values in the `Map` and check to see if any of them is a `2` or
 * a `3`. I convert each ID into an array, where element `0` reflects whether
 * two copies of any character were found (`1` if so, `0` otherwise), and
 * element `1` reflects whether three copies of any character were found (using
 * the same values). Then I just sum the values across all the arrays to
 * produce the desired counts, then multiply them together to get the answer.
 *
 * In part two, I try each pair of IDs and check for a single different
 * character between them. If I find one, I cut out that character and return
 * the two remaining sides concatenated together.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part to solve
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const boxIds = split(input);
  const parts = [ part1, part2 ];

  if (part !== undefined) {
    return parts[part - 1](boxIds);
  }

  return parts.map(fn => fn(boxIds));
};

/**
 * Produces the answer to part one of the puzzle.
 *
 * @param {Array} boxIds - the box IDs
 * @returns {number} - the answer to part one
 */
const part1 = boxIds => {
  const totals = boxIds.map(boxId => {
    const counts = [ ...countLetters(boxId).values() ];
    return [
      counts.includes(2) ? 1 : 0,
      counts.includes(3) ? 1 : 0,
    ];
  }).reduce(([ twoCount, threeCount ], [ two, three ]) => {
    return [ twoCount + two, threeCount + three ];
  }, [ 0, 0 ]);
  return totals[0] * totals[1];
};

/**
 * Produces the answer to part two of the puzzle.
 *
 * @param {Array} boxIds - the box IDs
 * @returns {string} - the answer to part two
 */
const part2 = boxIds => {
  const iLimit = boxIds.length - 1;

  for (let i = 0; i < iLimit; i++) {
    const boxId1 = boxIds[i];

    for (let j = i; j < boxIds.length; j++) {
      const boxId2 = boxIds[j];
      const index = findDiffIndex(boxId1, boxId2);

      if (index !== null) {
        return boxId1.substring(0, index) + boxId1.substring(index + 1);
      }
    }
  }
};

/**
 * Returns a `Map` giving the number of times each character appears in the
 * given box ID.
 *
 * @param {string} boxId - the box ID
 * @returns {Map} - the character counts
 */
const countLetters = boxId => [ ...boxId ].reduce((map, chr) => {
  map.set(chr, (map.get(chr) ?? 0) + 1);
  return map;
}, new Map());

/**
 * Finds the differences between the two box IDs. If they differ by exactly one
 * character, the index of that character is returned. Otherwise, it returns
 * `null`.
 *
 * @param {string} boxId1 - the first box ID
 * @param {string} boxId2 - the second box ID
 * @returns {number|null} - the index of the differing character, or `null`
 */
const findDiffIndex = (boxId1, boxId2) => {
  let index = null;

  for (let i = 0; i < boxId1.length; i++) {
    if (boxId1[i] !== boxId2[i]) {
      if (index !== null) {
        return null;
      }

      index = i;
    }
  }

  return index;
};
