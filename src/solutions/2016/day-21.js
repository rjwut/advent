const { split } = require('../util');

/**
 * # [Advent of Code 2016 Day 21](https://adventofcode.com/2016/day/21)
 *
 * The `OPERATIONS` array contains the objects that can detect whether a line
 * in the input corresponds to a particular operation, and if so, capture the
 * appropriate arguments and execute that operation on a given string in either
 * direction. Then we simply iterate the parsed operations (in reverse for part
 * two) and run them one by one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
 module.exports = input => {
  const scrambleFn = parse(input);
  return [
    { string: 'abcdefgh', reverse: false },
    { string: 'fbgdceah', reverse: true  },
  ].map(({ string, reverse }) => scrambleFn(string, reverse));
};

/**
 * Convenience for test code that can scramble or unscramble a single string.
 *
 * @param {string} input - the puzzle input
 * @param {string} string - the string to scramble or unscramble
 * @param {boolean} reverse - whether the string should be scrambled (`false`)
 * or unscrambled (`true`)
 * @returns {string} - the (un)scrambled string
 */
module.exports.solve = (input, string, reverse) => parse(input)(string, reverse);

/**
 * Switches two characters in the string by their indexes.
 *
 * @param {string} string - the string to modify
 * @param {number} param1.index0 - the index of the first character
 * @param {number} param1.index1 - the index of the second character
 * @returns {string} - the modified string
 */
const swapByIndex = (string, { index0, index1 }) => {
  if (index0 > index1) {
    const temp = index0;
    index0 = index1;
    index1 = temp;
  }

  return string.substring(0, index0) + string.charAt(index1) + string.substring(index0 + 1, index1) +
    string.charAt(index0) + string.substring(index1 + 1);
};

/**
 * Swaps all instances of any two characters.
 *
 * @param {string} string - the string to modify
 * @param {string} param1.letter0 - the first character
 * @param {string} param1.letter1 - the second character
 * @returns {string} - the modified string
 */
const swapLetters = (string, { letter0, letter1 }) => {
  return string.replaceAll(letter0, '~').replaceAll(letter1, letter0).replaceAll('~', letter1);
};

/**
 * Rotates the characters in the given string.
 *
 * @param {string} string - the string to modify
 * @param {string} param1.direction - either `'left'` or `'right'`
 * @param {number} param1.steps - the number of steps to rotate in that direction
 * @returns {string} - the modified string
 */
const rotate = (string, { direction, steps }) => {
  steps = steps % string.length;

  if (direction === 'right') {
    steps = -steps;
  }

  return string.slice(steps) + string.slice(0, steps);
};

/**
 * Rotates the chracters in the given string according to the index of the
 * given character, according to the rules described in the puzzle. When you
 * write out the results of the shifts, you end up with a predictable pattern
 * which can be encoded in two formulae, one to scramble and one to unscramble.
 *
 * @param {string} string - the string to modify
 * @param {string} param1.letter - the character to base rotation on 
 * @param {boolean} reverse - whether to undo the rotation
 * @returns {string} - the modified string
 */
const rotateBasedOnLetterPosition = (string, { letter }, reverse) => {
  const index = string.indexOf(letter);
  let steps;

  if (reverse) {
    steps = Math.floor(index / 2) + (index % 2 === 1 || index === 0 ? 1 : 5);
  } else {
    steps = -(index + 1 + (index >= 4 ? 1 : 0));
  }

  steps = Math.sign(steps) * (Math.abs(steps) % string.length);
  return string.slice(steps) + string.slice(0, steps);
};

/**
 * Reverse a range of characters in a string.
 *
 * @param {string} string - the string to modify
 * @param {number} param1.index0 - the index of the starting character to reverse
 * @param {number} param1.index1 - the index of the ending character to reverse
 * @returns {string} - the modified string
 */
const reverseRange = (string, { index0, index1 }) => {
  if (index0 > index1) {
    const temp = index0;
    index0 = index1;
    index1 = temp;
  }

  return string.substring(0, index0) +
    [ ...string.substring(index0, index1 + 1) ].reverse().join('') +
    string.substring(index1 + 1);
};

/**
 * Move a character from one position to another.
 *
 * @param {string} string - the string to modify
 * @param {number} index0 - the index of the character to move
 * @param {number} index1 - the index to move the character to
 * @returns {string} - the modified string
 */
const moveLetter = (string, index0, index1) => {
  const letter = string[index0];
  string = string.substring(0, index0) + string.substring(index0 + 1);
  return string.substring(0, index1) + letter + string.substring(index1);
};

const OPERATIONS = [
  { // swap position X with position Y
    regexp: /^swap position (?<index0>\d+) with position (?<index1>\d+)$/,
    fn: swapByIndex,
  },
  { // swap letter X with letter Y
    regexp: /^swap letter (?<letter0>\w) with letter (?<letter1>\w)$/,
    fn: swapLetters,
  },
  { // rotate left/right X step(s)
    regexp: /^rotate (?<direction>left|right) (?<steps>\d+) steps?$/,
    fn: (string, { direction, steps }, reverse) => {
      if (reverse) {
        direction = direction === 'left' ? 'right' : 'left';
      }

      return rotate(string, { direction, steps });
    },
  },
  { // rotate based on position of letter X
    regexp: /^rotate based on position of letter (?<letter>\w)$/,
    fn: rotateBasedOnLetterPosition,
  },
  { // reverse positions X through Y
    regexp: /^reverse positions (?<index0>\d+) through (?<index1>\d+)$/,
    fn: reverseRange,
  },
  { // move position X to position Y
    regexp: /^move position (?<index0>\d+) to position (?<index1>\d+)$/,
    fn: (string, { index0, index1 }, reverse) => {
      if (reverse) {
        const temp = index0;
        index0 = index1;
        index1 = temp;
      }

      return moveLetter(string, index0, index1);
    },
  },
];

/**
 * Parses the rules given in the puzzle input and returns a function that
 * executes them. This function accepts two arguments: the string to process,
 * and a boolean indicating whether it should be scrambled (`false`) or
 * unscrambled (`true`).
 *
 * @param {string} input - the puzzle input
 * @returns {Function} - the scramble function
 */
const parse = input => {
  const rules = split(input).map(line => {
    for (const { regexp, fn } of OPERATIONS) {
      const match = line.match(regexp);
  
      if (match) {
        const args = Object.fromEntries(
          Object.entries(match.groups).map(([ key, value ]) => {
            const firstChar = value.charAt(0);
  
            if (firstChar >= '0' && firstChar <= '9') {
              value = parseInt(value, 10);
            }
  
            return [ key, value ];
          })
        );
  
        return { args, fn };
      }
    }
  });

  /**
   * Scrambles (or unscrambles, if `reverse` is `true`) the given string
   * according to the rules specified in the puzzle input.
   */
  return (str, reverse) => {
    let start, limit, step;

    if (reverse) {
      start = rules.length - 1;
      limit = -1;
      step = -1;
    } else {
      start = 0;
      limit = rules.length;
      step = 1;
    }

    for (let i = start; i !== limit; i += step) {
      const rule = rules[i];
      str = rule.fn(str, rule.args, reverse);
    }

    return str;
  };
};
