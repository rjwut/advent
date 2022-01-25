const { split } = require('../util');

const PART_2_AMENDMENTS = {
  '8': {
    number: '8',
    def: [ [ '42' ], [ '42', '8' ] ],
    refs: [ '42' ],
    recursive: true,
  },
  '11': {
    number: '11',
    def: [ [ '42', '31' ], [ '42', '11', '31' ] ],
    refs: [ '42', '31' ],
    recursive: true,
  }
};
const RECURSION_LIMIT = 5;

/**
 * # [Advent of Code 2020 Day 19](https://adventofcode.com/2020/day/19)
 *
 * In part one, there are no cycles in the rules. In part two, rules #8 and #11
 * are replaced with self-referential rules. Both parts ask us to count how
 * many of the messages satisfy rule #0.
 * 
 * My solution follows these three steps:
 * 
 * 1. Parse the rules into arrays which describe them.
 * 2. Build a regular expression for each rule.
 * 3. Test the messages against rule #0.
 * 
 * ## Parsing the Rules
 *
 * For each line, I first split it on `': '` to separate the rule number from
 * the rule definition. I then test to see if the first character of the
 * definition is a double quote. If so, I strip off the quotes. Otherwise, I
 * split the definition on the pipe character, and each substring on the space
 * character. I then collect each rule number mentioned in the definition into
 * a `Set` so that I can easily check which rules are referenced by this one.
 * In the end, each rule is parsed into an object with the following
 * properties:
 * 
 * - `number` (string): The rule number
 * - `def` (string or array): The parsed rule definition
 * - `refs` (`Set`): The numbers of other rules referenced by this rule
 * - `recursive` (boolean): Whether this rule references itself
 * 
 * The parser doesn't need to worry about recursion, because for part two I
 * simply replace rules #8 and #11 with updated rule objects after parsing.
 * 
 * ## Building Regular Expressions
 *
 * The next step is to build the pattern strings for the regular expression
 * for each rule. Since rules depend on other rules, we have to build them in a
 * particular order:
 * 
 * 1. Create an empty patterns object which will store the patterns for each
 *    rule.
 * 2. Find all rules that are not yet stored in the patterns object and which
 *    do not reference any rules which are not in the patterns object.
 * 3. For each rule found, generate the rule pattern string.
 * 4. Repeat steps 2 and 3 until all rule pattern strings are generated.
 * 
 * To generate a non-recursive pattern string, we do the following:
 * 
 * 1. If the rule definition is a string, the rule's pattern is just that
 *    string.
 * 2. For each option in the rule definition, concatenate together the stored
 *    patterns for the named rules.
 * 3. Join the option patterns with a pipe (`|`) and wrap them in a
 *    non-capturing group.
 * 
 * For recursive rules, both of them have two options, one of which recurses
 * the other does not. Theoretically, this would require an infinitely-long
 * pattern string, but since there are no infinitely-long messages to parse, we
 * can limit the number of recursions to (as it turns out) five. Here's how we
 * do it:
 * 
 * 1. Identify which is the base (non-recursive) option and which is the
 *    recursive option.
 * 2. We break the recursive option apart at the recursive rule, so that we
 *    have the part to the left of the recursion and the part to the right.
 * 3. Generate the pattern strings for the base option and for each part of the
 *    recursive option.
 * 4. Concatenate together five repetitions of the left part, then the base
 *    pattern, then five repetitions of the right part, and wrap it all in a
 *    non-capturing group.
 * 
 * ## Testing the Messages
 *
 * Once the patterns have been generated, the last part is easy: pass the
 * pattern for rule #0 into the `RegExp` constructor to create a regular
 * expression, then iterate each message and test it against the regular
 * expression and count up the ones that match.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { rules, messages } = parse(input);
  return [ {}, PART_2_AMENDMENTS ].map(amendments => solve(rules, amendments, messages));
}

/**
 * Parses the input into a `rules` object and an array of messages.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed input data
 */
const parse = input => {
  const parts = split(input, { group: true });
  return {
    rules: parts[0].reduce((rules, line) => {
      const rule = parseRule(line);
      rules[rule.number] = rule;
      return rules;
    }, {}),
    messages: parts[1],
  };
};

/**
 * Produces the answer to a part using the given ruleset applied against the
 * messages. Any rules specified in the `amendments` object will replace those
 * with the same names in the ruleset.
 *
 * @param {Object} rules - the rules to apply
 * @param {Object} amendments - any amended rules
 * @param {Array} messages - the messages to which the rules should be applied
 * @returns {number} - the number of matches for rule #0
 */
const solve = (rules, amendments, messages) => {
  rules = { ...rules, ...amendments };
  const patterns = buildPatterns(rules);
  const regexp = new RegExp(`^${patterns['0']}$`);
  return countMatches(regexp, messages);
};

/**
 * Returns an object containing the patterns for each rule.
 *
 * @param {Object} rules - the rules to generate patterns for
 * @returns {Object} - the patterns for each rule
 */
const buildPatterns = rules => {
  const patterns = {};
  const ruleEntries = Object.values(rules);

  do {
    ruleEntries.forEach(rule => {
      if (rule.number in patterns) {
        return;
      }

      for (let ref of rule.refs) {
        if (!(ref in patterns)) {
          return;
        }
      }

      let pattern = (rule.recursive ? buildRecursivePattern : buildPattern)(rule, patterns);
      pattern && (patterns[rule.number] = pattern);
    });
  } while (Object.keys(patterns).length < ruleEntries.length);

  return patterns;
};

/**
 * Builds a pattern string for the given non-recursive rule. Where a rule
 * references other rules, the corresponding patterns for those rules will be
 * looked up from `patterns`.
 *
 * @param {Object} rule - the rule to build a pattern for
 * @param {Object} patterns - the previously-generated patterns
 * @returns {string} - the generated pattern
 */
const buildPattern = (rule, patterns) => {
  if (typeof rule.def === 'string') {
    return rule.def;
  }

  if (rule.def.length === 1 && rule.def[0].length === 1) {
    return patterns[rule.def[0]];
  }

  let pattern = [];
  pattern.push('(?:');
  const options = [];

  for (let option of rule.def) {
    let optionStr = '';

    for (let ruleNum of option) {
      if (!(ruleNum in patterns)) {
        return;
      }

      optionStr += patterns[ruleNum];
    }

    options.push(optionStr);
  }

  pattern.push(options.join('|'));
  pattern.push(')');
  return pattern.join('');
};

/**
 * Builds a pattern for a recursive rule. This splits the rule at the recursive
 * part, then builds the pattern by repeating the left and right parts up to
 * five times, with the base pattern in the middle.
 *
 * @param {Object} rule - the rule to build a pattern for
 * @param {Object} patterns - the previously-generated patterns
 * @returns {string} - the generated pattern
 */
const buildRecursivePattern = (rule, patterns) => {
  const buildPatternStr = options => options.map(ruleNum => patterns[ruleNum]).join('');
  const baseOption = rule.def.find(option => !option.includes(rule.number));
  const baseStr = buildPatternStr(baseOption);
  const recursiveOption = rule.def.filter(option => option !== baseOption)[0];
  const recursionIndex = recursiveOption.indexOf(rule.number);
  const leftOptionPart = recursiveOption.slice(0, recursionIndex);
  const rightOptionPart = recursiveOption.slice(recursionIndex + 1);
  const leftStr = buildPatternStr(leftOptionPart);
  const rightStr = buildPatternStr(rightOptionPart);
  const options = []

  for (let i = 0; i < RECURSION_LIMIT; i++) {
    options.push(`(?:${leftStr.repeat(i)}${baseStr}${rightStr.repeat(i)})`)
  }

  return `(?:${options.join('|')})`;
};

/**
 * Returns the number of messages that match the given regular expression.
 *
 * @param {RegExp} regexp - the regular expression to match against
 * @param {Array} messages - the messages to match
 * @returns {number} - the number of matches
 */
const countMatches = (regexp, messages) =>
  messages.filter(msg => regexp.test(msg)).length;

/**
 * Parses a single line into a rule object.
 *
 * @param {string} line - the line to parse
 * @returns {Object} - the parsed rule
 */
const parseRule = line => {
  let [ number, ruleDef ] = line.split(': ');
  let def;
  const refs = new Set();

  if (ruleDef.startsWith('"')) {
    def = ruleDef.substring(1, ruleDef.length - 1);
  } else {
    def = ruleDef.split(' | ').map(option => option.split(' '));
    def.forEach(option => option.forEach(ruleNum => refs.add(ruleNum)));
  }

  return { number, def, refs: Array.from(refs), recursive: false };
};
