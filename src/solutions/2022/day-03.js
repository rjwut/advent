const { split } = require('../util');
const { add } = require('../math2');

const LETTERS_BY_VALUE = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * # [Advent of Code 2022 Day 3](https://adventofcode.com/2022/day/3)
 *
 * Both parts arrange the input into groups, which I represent as arrays of arrays of strings.
 * Once they're grouped, they both process the groups in the same way: find the one letter that is
 * common among all the strings in the group, convert that to a number, then sum the numbers.
 *
 * For part one, each string is simply split in half. For part two, the strings are formed into
 * groups of three.
 *
 * The common letter in a group is found by converting all strings in the group to `Set`s of
 * characters, then computing their intersection. The result should have exactly one letter in it.
 *
 * After the common letter is found for each string or group for each part, they are converted to
 * scores (by looking up their indexes in `LETTERS_BY_VALUE`) and summed.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const sacks = split(input);
  return [ group1, group2 ].map(groupFn => {
    const groups = groupFn(sacks);
    const commonLetters = findCommonLettersForGroups(groups);
    return score(commonLetters);
  });
};

/**
 * Splits each sack into two parts.
 *
 * @param {Array<string>} sacks - the strings representing the contents of the sacks
 * @returns {Array<Array<string>} - the split sacks
 */
const group1 = sacks => sacks.map(sack => {
  const halfPos = sack.length / 2;
  return [
    sack.substring(0, halfPos),
    sack.substring(halfPos),
  ];
});

/**
 * Groups the sacks into groups of three.
 *
 * @param {Array<string>} sacks - the strings representing the contents of the sacks
 * @returns {Array<Array<string>} - the groups
 */
const group2 = sacks => {
  const groups = [];
  let curGroup = [];
  sacks.forEach(sack => {
    curGroup.push(sack);

    if (curGroup.length === 3) {
      groups.push(curGroup);
      curGroup = [];
    }
  });
  return groups;
};

/**
 * Finds the common letter for each of the given groups of strings.
 *
 * @param {Array<Array<string>>} groups - the groups
 * @returns {Array<string>} - the common letters
 */
const findCommonLettersForGroups = groups => groups.map(findCommonLetterInGroup);

/**
 * Finds the common letter for the given group of strings.
 *
 * @param {Array<string>} group - the group of strings
 * @returns {string} - the common letter
 */
const findCommonLetterInGroup = group => {
  group = group.map(sack => new Set([ ...sack ]));
  let common = group[0];

  for (let i = 1; i < group.length; i++) {
    common = intersection(common, group[i]);
  }

  return [ ...common ][0];
};

/**
 * Returns the intersection of the two given `Set`s.
 *
 * @param {Set} set1 - the first set
 * @param {Set} set2 - the second set
 * @returns {Set} - the intersection
 */
const intersection = (set1, set2) => new Set(
  [ ...set1 ].filter(el => set2.has(el))
);

/**
 * Computes the score for the given letters.
 *
 * @param {Array<string>} arr - the letters to score
 * @returns {number} - the score
 */
const score = arr => {
  const values = arr.map(letter => LETTERS_BY_VALUE.indexOf(letter));
  return add(values);
};
