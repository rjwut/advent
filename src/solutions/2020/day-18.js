const { add } = require('../math2');
const { split } = require('../util');

/**
 * A regular expression that can break an expression into tokens.
 */
const TOKEN_REGEXP = /\(|\)|\+|\*|\d/g // matches (, ), +, *, or a digit

/**
 * The supported operations.
 */
const OPERATIONS = {
  '+': (term1, term2) => term1 + term2,
  '*': (term1, term2) => term1 * term2,
};

/**
 * The order of operations for each part. The higher the number, the higher the
 * operator's priority.
 */
const ORDER_OF_OPERATIONS = [
  { '+': 1, '*': 1 },
  { '+': 2, '*': 1 }
];

/**
 * # [Advent of Code 2020 Day 18](https://adventofcode.com/2020/day/18)
 *
 * To handle these differing rules between the two parts, we'll create an
 * "operator dictionary". Whenever an operator is encountered, it will look it
 * up in the dictionary to get a precidence value. Higher precidence values
 * equal higher priority. For part one, `+` and `*` both have a precidence of
 * `1`. For part two, we change the precidence of `+` to `2`.
 *
 * ## Parsing
 *
 * First we need to parse the input. There are five different tokens:
 *
 * - `(`
 * - `)`
 * - `+`
 * - `*`
 * - a digit
 *
 * (The puzzle uses only positive terms with single digits. In theory, I could
 * have made it handle multi-digit numbers.)
 *
 * Running a line of input through the regular expression `/\(|\)|\+|\*|\d/g`
 * will identify all the tokens in that line. I then extract the tokens from
 * the match results and parse the digit tokens as integers. This produces an
 * array of tokens, so that an expression like this:
 *
 * ```json
 * '2 * 3 + (4 * 5)'
 * ```
 *
 * ...becomes the following token array:
 *
 * ```json
 * [ 2, '*', 3, '+', '(', 4, '*', 5, ')' ]
 * ```
 *
 * ## Building the Binary Expression Tree
 *
 * The next step is to build a binary expression tree that properly reflects
 * the operator precidence. For part one, the example expression used above
 * produces the following tree:
 *
 * ```txt
 *      +
 *     / \
 *    /   \
 *   *     *
 *  / \   / \
 * 2   3 4   5
 * ```
 *
 * But for part two, it looks like this:
 *
 * ```txt
 *   *
 *  / \
 * 2   +
 *    / \
 *   3   *
 *      / \
 *     4   5
 * ```
 * 
 * We can recursively construct the tree by following these steps:
 * 
 * 1. If the expression has only one token, it is a number; return a number
 *    node containing that value and skip the remaining steps.
 * 2. Find the lowest-priority operator. This is identified as follows:
 *    a. Scan the expression from left to right, tracking the depth of the
 *       parentheses as you go.
 *    b. Ignore any operators encountered while the parentheses depth is
 *       greater than 0.
 *    c. The each operator you encounter outside parentheses becomes the new
 *       lowest-priority operator, unless the current lowest-priority operator
 *       has lower priority.
 * 3. Create a new operator node for the lowest priority operator.
 * 4. Split the expression at the operator into a left side and a right side.
 * 5. Strip any unneeded parentheses from each side.
 * 6. Recurse for each side.
 * 7. Set the `left` and `right` properties of the operator node to the return
 *    values from the recursions.
 * 8. Return the operator node.
 * 
 * ## Evaluating the Binary Expression Tree
 *
 * Now that we have the tree, we can evaluate it. To do this, we follow these
 * steps, starting at the root node of the tree:
 * 
 * 1. If the node is a number, just return that number and skip the remaining
 *    steps.
 * 2. Recurse on the `left` and `right` nodes. Each of these will return a
 *    numeric value.
 * 3. Perform the operation indicated by the operator node on the left and
 *    right values, and return the result.
 *
 * For both parts, the expected answer is the sum of all the answers for each
 * input line.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const tokenLists = parse(input);
  return ORDER_OF_OPERATIONS.map(priorities => {
    const answers = tokenLists.map(tokens => solve(tokens, priorities));
    return add(answers);
  });
};

/**
 * Parses the input in to an array of token lists.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - array of token lists
 */
const parse = input => split(input).map(parseLine);

/**
 * Parses a single line into a token list.
 *
 * @param {string} line - the input line
 * @returns {Array} - the resulting token list
 */
const parseLine = line => Array.from(line.matchAll(TOKEN_REGEXP))
  .map(match => match[0])
  .map(token => '+*()'.includes(token) ? token : parseInt(token));

/**
 * Solve a single token list.
 *
 * @param {Array} tokens - the list of tokens 
 * @param {Object} priorities - an operator priority dictionary
 * @returns {number} - the evaluated expression value
 */
const solve = (tokens, priorities) => evaluate(buildTree(tokens, priorities));

/**
 * Builds a binary expression tree from the given list of tokens, respecting
 * the specified operator priority dictionary. Operator precidence is as
 * follows:
 * - Parentheses override all other priorities.
 * - The operator with the higher priority value in the dictionary wins.
 * - The left operator wins.
 * 
 * Each tree node has a `type` (either `'operator'` or `'number'`) and a
 * `value` (the number or operator at that node). If it's an operator, it will
 * also have a `left` node and a `right` node.
 * 
 * @param {Array} tokens - the list of tokens
 * @param {Object} priorities - an operator priority dictionary
 * @returns {Object} - the root of the expression tree
 */
const buildTree = (tokens, priorities) => {
  // If the token list contains only one token, return it as a leaf node.
  if (tokens.length === 1) {
    return { type: 'number', value: tokens[0] };
  }

  // Split the token list at the lowest priority operator and recurse for each
  // side.
  const splitIndex = findLowestPriorityOperator(tokens, priorities);
  const left = stripUnneededParentheses(tokens.slice(0, splitIndex));
  const right = stripUnneededParentheses(tokens.slice(splitIndex + 1));
  return {
    type: 'operator',
    value: tokens[splitIndex],
    left: buildTree(left, priorities),
    right: buildTree(right, priorities),
  };
};

/**
 * Evaluates the given binary expression node.
 *
 * @param {Object} node - the node to evaluate
 * @returns {number} - the resulting value
 */
const evaluate = node => {
  if (node.type === 'number') {
    return node.value;
  }

  return OPERATIONS[node.value](evaluate(node.left), evaluate(node.right));
};

/**
 * Returns the index of the lowest priority operator in the given array of
 * tokens.
 *
 * @param {Array} tokens - the list of tokens to search
 * @param {Object} priorities - an operator priority dictionary
 * @returns {number} - the index of the lowest priority operator
 */
const findLowestPriorityOperator = (tokens, priorities) => {
  let depth = 0;
  return tokens.reduce((winner, token, i) => {
    if (token in priorities && !depth) {
      // We've found an operator outside of parentheses.
      const priority = priorities[token];

      if (!winner || priority <= winner.priority) {
        // No current winner, or token has same or lower priority.
        // Make it the new winner.
        return { priority, index: i };
      }
    }

    // Not an operator; check for parentheses.
    if (token === '(') {
      depth++;
    } else if (token === ')') {
      depth--;
    }

    return winner;
  }, null).index;
};

/**
 * Determines whether the entire expression in the given token array is wrapped
 * in parentheses, and if so, strips them off.
 *
 * @param {Array} tokens - the token array
 * @returns {Array} - the stripped token array
 */
const stripUnneededParentheses = tokens => {
  do {
    // If the token list doesn't start with ( and end with ), we're done.
    if (tokens[0] !== '(' || tokens[tokens.length - 1] !== ')') {
      return tokens;
    }

    // Scan for the matching parenthesis to the one at index 0.
    // If we find it before reaching the end, we're done.
    const len = tokens.length - 1;
    let depth = 1;

    for (let i = 1; i < len; i++) {
      const token = tokens[i];

      if (token === '(') {
        depth++;
      } else if (token === ')') {
        depth--;

        if (!depth) {
          return tokens; // Found it!
        }
      }
    }

    // We have unneeded parentheses; strip them off.
    tokens = tokens.slice(1, len);
  } while(true);
};
