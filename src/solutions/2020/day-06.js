const { add } = require('../math2');
const { split } = require('../util');

const QUESTIONS = [];

for (let i = 97; i < 123; i++) {
  QUESTIONS.push(String.fromCharCode(i));
}

/**
 * # [Advent of Code 2020 Day 6](https://adventofcode.com/2020/day/6)
 *
 * Like the Day 4 puzzle, the puzzle input here is in groups separated by blank
 * lines, so I'm making use of the grouping feature of `split()` again. The two
 * parts use different aggregation strategies, so I broke them off into two
 * separate functions, `anySaidYes` and `allSaidYes`. Each accepts the lines
 * from a group and returns the number of questions where any/all of the
 * group's members said "yes."
 * 
 * The implementation for `anySaidYes` is pretty easy: simply iterate the lines
 * and iterate the letters in each line, and for each letter found, add them to
 * a `Set`. After all lines are iterated, the number of letters in the `Set` is
 * the number of questions where any member of the group answered "yes."
 * 
 * Implementing `allSaidYes` is a little trickier. We start with an array with
 * 26 elements and fill them with `true`. This will record whether we have only
 * encountered a "yes" so far for each question. Then we iterate the lines, and
 * test each of the 26 letters to see which ones are absent from the line. If a
 * letter is found to be absent, we set its corresponding element in our answer
 * array to `false` to record that not all members of the group answered "yes"
 * to that question. After all lines are iterated, we count the `true` values
 * in the answer array to learn how many questions had all group members answer
 * "yes."
 * 
 * With our two aggregation strategies implemented, we simply `map()` the array
 * of groups with the aggregation strategy, and add up the results.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input, { group: true });
  return [ anySaidYes, allSaidYes ].map(fn => solve(input, fn));
};

/**
 * Solves a part of the puzzle. Each group is passed to an aggregation function
 * which returns a single number, and the numbers from all groups are summed.
 *
 * @param {Array} input - the puzzle input as groups of lines
 * @param {Function} fn - the aggregation function to apply to each group
 * @returns {number} - the puzzle output
 */
const solve = (input, fn) => add(input.map(fn));

/**
 * Returns the number of questions where any member of the group answered yes.
 *
 * @param {Array} group - the input lines for the group
 * @returns {number} - how many questions got at least one "yes" from the group
 */
const anySaidYes = group => {
  const yesses = new Set();
  group.forEach(person => {
    [ ...person ].forEach(yes => yesses.add(yes));
  });
  return Array.from(yesses).length;
};

/**
 * Returns the number of questions where all members of the group answered yes.
 *
 * @param {Array} group - the input lines for the group
 * @returns {number} - how many questions got "yeses" from every member of the
 * group
 */
const allSaidYes = group => {
  const allYes = new Array(26);
  allYes.fill(true);
  group.forEach(person => {
    QUESTIONS.forEach((question, i) => {
      if (person.indexOf(question) === -1) {
        allYes[i] = false;
      }
    });
  });
  return allYes.filter(question => question).length;
};
