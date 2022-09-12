/**
 * A collection of utility functions that are useful for multiple puzzles.
 */
const Util = {
  /**
   * Determines whether the two given arrays are equal (have the same lengths and
   * equal elements at each index).
   *
   * @param {Array} a - the first array
   * @param {Array} b - the second array
   * @returns {boolean} - `true` if they're equal; `false` otherwise
   */
  arraysEqual: (a, b) => a.length === b.length &&
    a.every((value, i) => value === b[i]),

  /**
   * Creates a new two-dimensional array with the given dimensions. If `fill`
   * is provided, each cell is initialized to the given value.
   *
   * @param {number} width - the width of the new grid
   * @param {number} height - the height of the new grid
   * @param {*} [fill] - the value with which to populate each cell
   * @returns {Array} - the new grid
   */
  grid: (width, height, fill) => {
    const grid = Array.from(
      new Array(height),
      () => new Array(width)
    );

    if (fill !== undefined) {
      grid.forEach(row => row.fill(fill));
    }

    return grid;
  },

  /**
   * Groups the elements in the given iterable object according to the keys
   * they return when passed into `keyFn`. The returned `Map` contains an entry
   * for each unique key received from `keyFn`. The value under each key is an
   * array of elements that were grouped under that key.
   *
   * The callback specified in `keyFn` receives the following arguments for
   * each element:
   *
   * 1. The element itself
   * 2. The index of the element
   * 3. The `Iterable` from which the element came
   *
   * @param {Iterable} iterable - the elements to group
   * @param {Function} keyFn - a function that returns the group key for the
   * element passed into it
   * @returns {Map<*, Array>} - the groups
   */
  group: (iterable, keyFn) => {
    const groups = new Map();
    let i = 0;

    for (let element of iterable) {
      const key = keyFn(element, i, iterable);
      const group = groups.get(key);

      if (!group) {
        groups.set(key, [ element ]);
      } else {
        group.push(element);
      }

      i++;
    }

    return groups;
  },


  /**
   * Uses a regular expression to extract records from the given string and
   * return them as an array of objects. The provided regular expression must
   * be global (`/g`) and must have at least one named capture group.
   *
   * The property values of the record objects may optionally be coerced before
   * they are returned. This can be done by providing an object to `coerce`
   * which maps coercion functions to property names. For example, to convert
   * the values stored under the `index` key to numbers, you could provide the
   * following `coerce` object:
   *
   * ```js
   * { index: Number }
   * ```
   *
   * You may also specify a function for `coerce`, in which case the entire
   * match groups object is passed in, and the function should returned the
   * coerced record object.
   *
   * @param {string} string - the string to parse
   * @param {RegExp} regexp - the regular expression to use to extract records
   * @param {Function|Object} [coerce] - the coercion functions to use, if any
   * @returns {Array<Object>} - the extracted records
   */
  match: (string, regexp, coerce = {}) => {
    let coercions;

    switch (typeof coerce) {
    case 'function':
      break;

    case 'object':
      coercions = Object.entries(coerce);
      coerce = record => {
        coercions.forEach(([ key, fn ]) => {
          const value = record[key];

          if (value !== undefined) {
            record[key] = fn(value);
          }
        });
        return record;
      };
      break;

    case 'undefined':
      coerce = record => record;
      break;

    default:
      throw new Error('The coerce argument must be a function or object if specified');
    }

    return [ ...string.matchAll(regexp) ]
      .map((match, i) => coerce(match.groups, i));
  },

  /**
   * Parses the input string as a two-dimensional character grid.
   *
   * Options:
   * 
   * - `parseInt` (boolean): whether to parse each cell as an integer
   *
   * @param {string} input - the input string
   * @param {Object} options - the options object
   * @returns {Array<Array<string|number>>} - the two-dimensional array
   */
  parseGrid: (input, options = {}) => {
    input = input.replaceAll('\r', '');
    const grid = input.split('\n')
      .filter(line => line)
      .map(line => [ ...line ]);

    if (options.parseInt) {
      grid.forEach((row, i) => {
        grid[i] = row.map(value => parseInt(value, 10));
      });
    }

    return grid;
  },

  /**
   * Given an array of elements, returns an array containing all permutations
   * of those elements, where each permutation is an array of the same length
   * as the original `elements` array. For example, `permute([ 1, 2, 3 ])`
   * returns this:
   *
   * ```json
   * [
   *   [ 1, 2, 3 ],
   *   [ 1, 3, 2 ],
   *   [ 2, 1, 3 ],
   *   [ 2, 3, 1 ],
   *   [ 3, 1, 2 ],
   *   [ 3, 2, 1 ]
   * ]
   * ```
   *
   * @param {Array} elements - the elements to permute
   * @returns {Array<Array>} - the permutations
   */
  permute: elements => {
    const permutations = [];
    permuteInternal([], elements, permutations);
    return permutations;
  },

  /**
   * Splits the given input on a delimiter, and trims each token.
   *
   * Options:
   * - `delimiter` (string, default = '\n'): The delimiter to split on
   * - `group` (boolean, default = `false`): Whether input tokens should be
   *   grouped, assuming that groups are separated by a blank token
   * - `parseInt` (boolean, default = `false`): Whether non-blank tokens
   *   should be parsed as integers.
   *
   * If `group` is `true`, the return value will be an array of arrays, where
   * each inner array is a group of tokens. Otherwise, it will just be a single
   * array containing the tokens (optionally parsed as numbers).
   *
   * @param {string} input - the input string to be split
   * @param {Object} options
   * @returns {Array} - the processed tokens
   */
  split: (input, options) => {
    options = {
      delimiter: '\n',
      group: false,
      parseInt: false,
      ...options,
    };
    // Split apart the tokens and trim them
    input = input.replaceAll('\r', '');
    let tokens = input.split(options.delimiter)
      .map(token => token.trim());

    if (options.group) {
      // Group tokens
      const groups = [];
      let group = [];
      tokens.forEach(token => {
        if (token) { // non-blank token; add to current group
          group.push(options.parseInt ? parseInt(token, 10) : token);
        } else {     // blank token; start a new group
          groups.push(group);
          group = [];
        }
      });

      if (group.length) {
        groups.push(group); // add the last group
      }

      return groups;
    }

    tokens = tokens.filter(token => token); // remove blank tokens

    if (options.parseInt) { // parse tokens as integers
      tokens = tokens.map(token => parseInt(token, 10));
    }

    return tokens;
  },
};

/**
 * Recursive internal implementation for `permute()`.
 *
 * @param {Array} selected - the elements selected so far for the current
 * permutation branch
 * @param {Array} remaining - the elements not yet selected for the current
 * permutation branch
 * @param {Array<Array>} permutations - the permutations found so far
 */
const permuteInternal = (selected, remaining, permutations) => {
  remaining.forEach((element, i) => {
    const newSelected = [ ...selected, element ];

    if (remaining.length === 1) {
      permutations.push(newSelected);
    } else {
      const newRemaining = [ ...remaining ];
      newRemaining.splice(i, 1);
      permuteInternal(newSelected, newRemaining, permutations);
    }
  });
};

module.exports = Util;
