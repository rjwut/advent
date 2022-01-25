const { split } = require('../util');

/**
 * # [Advent of Code 2021 Day 14](https://adventofcode.com/2021/day/14)
 *
 * A brute force solution using an array of characters would be super
 * expensive. A linked list is a little better because it avoids the cost of
 * index shifting, but it's still too slow. We can instead use a similar
 * solution as [the day 6 lanternfish puzzle](./day-6.js). Instead of tracking
 * each individual element or pair, we track the number of times each pair
 * occurs. With each pass, each pair `left + right` is replaced with two new
 * pairs: `left + inserted` and `inserted + right`.
 *
 * Since we're only ultimately interested in the number of times the elements
 * occur, order doesn't matter... _almost_. Every element in the polymer
 * belongs to two pairs, except the first and last ones, which are only in one.
 * So when it comes time to count the number of times an element appears in the
 * polymer, we count the number of pairs in which it appears as the second
 * element in the pair, and subtract one for the first element.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => run(parse(input));

/**
 * Parses the puzzle input.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed polymer template and rules
 */
const parse = input => {
  const lines = split(input);
  const rules = lines.slice(1).reduce((rules, line) => {
    const [ pair, insert ] = line.split(' -> ');
    rules[pair] = insert;
    return rules;
  }, {});
  return { template: lines[0], rules };
};

/**
 * Runs through the element insertions, and returns the puzzle answers for 10
 * passes (part one) and 40 passes (part two).
 *
 * @param {string} param.template - the polymer template
 * @param {Object} param.rules - the rules for element insertion
 * @returns {Array} - the puzzle answers
 */
const run = ({ template, rules }) => {
  let answers = [];
  const len = template.length - 1;
  let pairCounts = {};

  for (let i = 0; i < len; i++) {
    add(pairCounts, template.charAt(i) + template.charAt(i + 1), 1);
  }

  for (let i = 0; i < 40; i++) {
    pairCounts = pass(pairCounts, rules);

    if (i === 9) {
      answers.push(computeAnswer(template, pairCounts));
    }
  }

  answers.push(computeAnswer(template, pairCounts));
  return answers;
};

/**
 * Executes a single element insertion pass.
 *
 * @param {Object} pairCounts - the number of times each pair occured in the
 * previous pass
 * @param {Object} rules - the rules for element insertion
 * @returns {Object} - the updated pair counts
 */
const pass = (pairCounts, rules) => Object.entries(pairCounts)
  .reduce((newCounts, [ pair, count ]) => {
    const left = pair.charAt(0);
    const right = pair.charAt(1);
    add(newCounts, left + rules[pair], count);
    add(newCounts, rules[pair] + right, count);
    return newCounts;
  }, {});

/**
 * Adds `count` to the value stored in `obj[key]`, or initializes it to `count`
 * if `key` is not present in `obj`.
 *
 * @param {Object} obj - the object whose property should be updated
 * @param {string} key - the key of the property to update
 * @param {number} count - the number to add to the property (or set if the
 * property doesn't exist)
 */
const add = (obj, key, count) => {
  obj[key] = (obj[key] || 0) + count;
};

/**
 * Computes the answer for one of the parts of the puzzle.
 *
 * @param {string} template - the original polymer template
 * @param {Object} pairCounts - the number of times each pair occured in the
 * polymer
 * @returns {number} - the puzzle part answer
 */
const computeAnswer = (template, pairCounts) => {
  const letterCounts = Object.entries(pairCounts)
    .reduce((counts, [ pair, count ]) => {
      add(counts, pair.charAt(1), count);
      return counts;
    }, {});
  letterCounts[template.charAt(0)]--;
  const sortedCounts = Object.values(letterCounts)
    .sort((a, b) => b - a);
  return sortedCounts[0] - sortedCounts[sortedCounts.length - 1];
};
