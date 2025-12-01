const { match } = require('../util');

const SENTENCE_REGEXP = /^(?<color>\S+\s\S+) bags contain (?<contents>.+)\.$/gm;
const BAGS_REGEXP = /(?<count>\d+)\s(?<color>\S+\s\S+) bag/g;
const TARGET_BAG_COLOR = 'shiny gold';

/**
 * # [Advent of Code 2020 Day 7](https://adventofcode.com/2020/day/7)
 *
 * This is the first puzzle for 2020 where a brute force solution will likely
 * land you in trouble. The first order of business is to parse the rule
 * Regular expressions come to the rescue again: we can parse each sentence
 * with:
 *
 * ```js
 * /^(?<color>\S+\s\S+) bags contain (?<contents>.+)\.$/
 * ```
 *
 * ...and each `contents` clause with:
 *
 * ```js
 * /(?<count>\d+)\s(?<color>\S+\s\S+) bag/g
 * ```
 *
 * So to parse the input, I `map()` each line into an object with the following
 * properties:
 *
 * - `color` (string): The color of the containing bag.
 * - `contents` (array): An array of objects describing the contents of the
 *   bag:
 *   - `count` (number): The number of this type of bag
 *   - `color` (string): The color of the contained bag(s)
 *
 * Part one asks how many different color bags can eventually contain a shiny
 * gold bag, while part two asks the total number of bags contained by a shiny
 * gold bag. Attempting to brute force this would be a prohibitively expensive
 * operation. So now that the rules are parsed, we can do some preprocessing
 * for each bag color to determine 1) the colors of all bags eventually
 * contained by that color of bag, and 2) the number of bags you're holding
 * (directly or indirectly) when you hold a bag of that color.
 *
 * Let's use as an example the last five lines of the sample input:
 *
 * ```txt
 * 1. shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
 * 2. dark olive bags contain 3 faded blue bags, 4 dotted black bags.
 * 3. vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
 * 4. faded blue bags contain no other bags.
 * 5. dotted black bags contain no other bags.
 * ```
 *
 * Let's start with the innermost bags, those which contain no other bags, so I
 * put rules #4 and #5 in a queue:
 *
 * So first I process rule #4. Since nothing is inside it, it contains no other
 * colors of bags, and when you're holding a faded blue bag, you're only
 * holding one bag. So the precomputed results for faded blue bags are:
 *
 * ```txt
 * {
 *   'faded blue': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 * }
 * ```
 *
 * Each time we finish computing a rule, we check to see if there are any rules
 * we haven't precomputed yet but whose contents are now all precomputed. There
 * are no rules which describe bags that only contain faded blue bags, so we
 * add nothing to the queue yet.
 *
 * Now we take rule #5 off the queue and process it. Our precomputed results
 * now look like this:
 *
 * ```txt
 * {
 *   'dotted black': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 *   'faded blue': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 * }
 * ```
 *
 * We now have the information we need to do the computations for rules #2 and
 * #3, so we add them to queue. When we process a bag, the `colors` `Set` will
 * contain the colors of the directly contained bags, plus the colors in their
 * `colors` `Set`s; and the `bags` property will be set to the sum of the
 * `bags` properties of the directly contained bags plus 1. After they're
 * processed, our precomputed results look like this:
 *
 * ```txt
 * {
 *   'dark olive': {
 *     colors: Set [ 'dotted black', 'faded blue' ],
 *     bags: 8,
 *   },
 *   'dotted black': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 *   'faded blue': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 *   'vibrant plum': {
 *     colors: Set [ 'dotted black', 'faded blue' ],
 *     bags: 12,
 *   },
 * }
 * ```
 *
 * We finally have the information we need to compute for shiny gold bags, so
 * rule #1 goes on the queue. It's the only thing on the queue, so it gets
 * immediately processed:
 *
 * ```txt
 * {
 *   'dark olive': {
 *     colors: Set [ 'dotted black', 'faded blue' ],
 *     bags: 8,
 *   },
 *   'dotted black': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 *   'faded blue': {
 *     colors: Set [],
 *     bags: 1,
 *   },
 *   'shiny gold': {
 *     colors: set [ 'dark olive', 'dotted black', 'faded blue', 'vibrant plum' ],
 *     bags: 33,
 *   },
 *   'vibrant plum': {
 *     colors: Set [ 'dotted black', 'faded blue' ],
 *     bags: 12,
 *   },
 * }
 * ```
 *
 * Once this processing has happened for all the rules in our input, solving
 * the two parts of the puzzle becomes trivial. For part one, we simply count
 * how many entries in our precomputed results contains 'shiny gold' in the
 * `colors` `Set`. For part two, we take the value of `bags` in the `shiny
 * gold` entry and subtract one (since we're not including the shiny gold bag
 * itself in the answer).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const rules = parse(input);
  const contents = computeContents(rules);
  return [ howManyCanEventuallyContain, totalContained ]
    .map(fn => fn(contents, TARGET_BAG_COLOR));
};

/**
 * Accepts the puzzle input, where each rule is a line formatted like this:
 *
 * ```txt
 * {color} bags contain {contents}.
 * ```
 *
 * where `color` is two words and `contents` can either be `'no other bags'` or
 * a comma-delimited list of the bag's contents, where each item in the list is
 * formatted like this:
 *
 * ```txt
 * {count} {color} bag[s]
 * ```
 *
 * These rules are parsed, and an array describing the rules is returned. Each
 * array entry is an object representing a single rule, with `color` declaring
 * the color of bag described by the rule, and `contents` being an array of
 * content entries. Each content entry is an object with two properties:
 * `color` contains the color of the bag that may be contained by the outer
 * bag, and `count` contains the number of bags of that color that it may
 * contain.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the resulting rules
 */
const parse = input => match(input, SENTENCE_REGEXP, matchObj => ({
  color: matchObj.color,
  contents: match(matchObj.contents, BAGS_REGEXP),
}));

/**
 * Computes the results of the given set of rules. Each key in the returned
 * object is a bag color, and the value is an object with two properties:
 *
 * - `colors`: An array containing all the other bag colors that a bag of this
 *   color contains (directly or indirectly).
 * - `bags`: The number of bags you're holding (directly and indirectly) when
 *   you hold a bag of this color.
 *
 * @param {Array} rules - the rules
 * @returns {Object} - the results of the rules
 */
const computeContents = rules => {
  const results = {};
  const queue = [];
  pushToQueue(queue, rules, results);

  while (queue.length) {
    const rule = queue.shift();
    const result = {
      colors: new Set(),
      count: 1,
    };
    results[rule.color] = result;
    rule.contents.forEach(contentEntry => {
      const contentResult = results[contentEntry.color];
      result.colors.add(contentEntry.color);
      contentResult.colors.forEach(color => {
        result.colors.add(color)
      });
      result.count += contentEntry.count * contentResult.count;
    });
    pushToQueue(queue, rules, results);
  }
  return results;
};

/**
 * Pushes rule entries to the queue that meet the following criteria:
 *
 * - Rule isn't already in the queue.
 * - No result entry exists for that bag color in the results object.
 * - All contained bag colors declared by that rule have result entries.
 *
 * @param {Array} queue - the queue to populate
 * @param {Array} rules - the rules
 * @param {Object} results - the results object
 */
const pushToQueue = (queue, rules, results) => {
  rules.filter(rule => {
    if (queue.includes(rule) || results[rule.color]) {
      return false;
    }

    return rule.contents.every(contentEntry => results[contentEntry.color]);
  }).forEach(rule => queue.push(rule));
};

/**
 * Given the computed results of the rules, returns the number of distinct bag
 * colors that can eventually contain a bag of the given color.
 *
 * @param {Object} results - the computed rules results
 * @param {string} color - the color being tested
 * @returns {number} - number of bag colors that can contain the indicated
 * color
 */
const howManyCanEventuallyContain = (results, color) => Object.values(results)
  .map(result => result.colors.has(color))
  .filter(hasColor => hasColor).length;

/**
 * Given the computed results of the rules, returns the number of bags
 * contained (directly or indirectly) by a bag of the given color.
 *
 * @param {Object} results - the computed rules results
 * @param {string} color - the color being tested
 * @returns {number} - number of bags contained by a bag of that color
 */
 const totalContained = (results, color) => results[color].count - 1;
