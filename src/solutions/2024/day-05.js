const { arraysEqual, split } = require('../util');

/**
 * # [Advent of Code 2024 Day 5](https://adventofcode.com/2024/day/5)
 *
 * The basic solution outline is:
 *
 * 1. Sort each update according to the rules.
 * 2. Determine the middle page number.
 * 3. If the sorted update is in the same order as the original, add the middle page number to the
 *    answer for part one; otherwise, add it to part two's answer.
 *
 * For sorting an update, it's important to note that the rules aren't necessarily transitive. The
 * puzzle text explicitly states that a rule that mentions a page not included in an update should
 * be ignored. So if rule A says page 1 is updated before page 2, and rule B says page 2 is updated
 * before page 3, you might assume that page 1 must be updated before page 3. But if page 2 isn't
 * included in the update, then both rules A and B are ignored, and therefore page 3 could
 * potentially be updated first. Therefore, before attempting to sort an update, you should filter
 * out any rules that mention a page not included in that update.
 *
 * After that, find the page in the update that is never mentioned as coming after another page in
 * any of the rules; this is the first page, so push it to the sorted update array. Remove it from
 * the original update, and remove all rules that mention that page. Repeat this process until no
 * more pages remain in the update. The update is now sorted.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { rules, updates } = parse(input);
  let answers = [ 0, 0 ];
  updates.forEach(update => {
    const sorted = sortUpdate(rules, update);
    const part = arraysEqual(update, sorted) ? 0 : 1;
    answers[part] += sorted[Math.floor(sorted.length / 2)];
  });
  return answers;
};

/**
 * Parses the input into `rules` and `updates`, which are returned in an object. The `rules`
 * property is an array of rules, where each rule is an array of two numbers, with the first being
 * the page that the rule says comes before the second. The `updates` property is an array of
 * updates, where each update is an array of page numbers to be updated.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed rules and updates
 */
const parse = input => {
  let [ rules, updates ] = split(input, { group: true });
  rules = rules.map(rule => rule.split('|').map(Number));
  updates = updates.map(update => update.split(',').map(Number));
  return { rules, updates };
};

/**
 * Sorts the given update according to the rules.
 *
 * @param {number[][]} rules - the rules to apply
 * @param {number[]} update - the pages to update
 * @returns {number[]} - the sorted update
 */
const sortUpdate = (rules, update) => {
  update = [ ...update ]; // clone so the original isn't affected by splices
  rules = rules.filter(   // ignore rules that don't apply to this update
    ([ before, after ]) => update.includes(before) && update.includes(after)
  );
  const sorted = [];

  do {
    for (let i = 0; i < update.length; i++) {
      const page = update[i];

      // Is this page first (i.e. no rule says that it comes after another page)?
      if (!rules.some(([ , after ]) => after === page)) {
        // Add the page to the sorted list and remove it from the update
        sorted.push(page);
        update.splice(i, 1);
        // Remove all rules that involve this page
        rules = rules.filter(([ before, after ]) => before !== page && after !== page);
        break;
      }
    }
  } while (update.length);

  return sorted;
};
