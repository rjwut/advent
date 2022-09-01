/**
 * # [Advent of Code 2015 Day 12](https://adventofcode.com/2015/day/12)
 *
 * The only thing different between the two parts of the puzzle is whether the
 * objects with `'red'` values get skipped or not, so this is made a parameter.
 * To simplify the recursion through the object tree, I wrote a `coerce()`
 * function which converts any value it may encounter in the tree to either a
 * simple number or an array to recurse through. In part two, this method
 * checks objects for a value set to `'red'`, and returns `0` instead of the
 * array of values in that case.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = JSON.parse(input);
  return [ false, true ].map(skipRed => compute(input, skipRed));
};

/**
 * Computes the answer to a part of the puzzle.
 *
 * @param {*} input - the puzzle input (parsed as JSON)
 * @param {boolean} skipRed - whether to skip `Object`s containing a property
 * with the value `'red'`
 * @returns {number} - the sum of all selected numeric values found in the
 * input
 */
const compute = (input, skipRed) => {
  input = coerce(input, skipRed);

  if (typeof input === 'number') {
    return input;
  }

  return input.reduce((sum, value) => sum + compute(value, skipRed), 0);
};

/**
 * Coerces the given value to either a number or an array, using these rules:
 *
 * 1. If the value is a number, that number is returned.
 * 2. If the value is an array, that array is returned.
 * 4. If the value is an `Object` and either `skipRed` is falsy or none if its
 *    values is `'red'`, an array of its values will be returned.
 * 5. In any other case, `coerce()` returns `0`.
 *
 * @param {*} input - the input value to coerce
 * @param {boolean} skipRed - whether to skip `Object`s containing a property
 * with the value `'red'`
 * @returns {number|array} - the coerced value
 */
const coerce = (input, skipRed) => {
  const type = typeof input;

  if (type === 'number' || Array.isArray(input)) {
    return input;
  }

  if (type === 'object' && input !== null) {
    const elements = Object.values(input);

    if (!skipRed || elements.every(el => el !== 'red')) {
      return elements;
    }
  }

  return 0;
};
