const MIN_CHAR_CODE = 'a'.charCodeAt(0);
const MAX_CHAR_CODE = 'z'.charCodeAt(0);
const INVALID_CHAR_CODES = [ 'i', 'l', 'o' ].map(chr => chr.charCodeAt(0));

/**
 * # [Advent of Code 2015 Day 11](https://adventofcode.com/2015/day/11)
 *
 * There are two things that are likely to trip you up on this puzzle. The
 * first is getting one of the three invalid characters (`i`, `l`, or `o`) near
 * the left side of the prospective password. If you continue to increment
 * passwords one by one, you're going to be incrementing past a bunch of
 * invalid passwords and wasting a lot of time. Instead, we check for an
 * invalid character in any position, increment that character, and set all
 * characters to its right to `a`. This is the first prospective password after
 * that one that does not contain an invalid character (though it may still not
 * be a valid password).
 *
 * The second pitfall is forgetting that the required two sets of doubled
 * characters _cannot overlap_. So when iterating through the password to look
 * for doubled characters, you must be sure to skip a character when you find
 * the first double so that a triple like `aaa` doesn't get counted as two
 * doubles.
 *
 * To simplify the incrementing of characters, I convert the password to an
 * array of character codes first, then convert back once I've found the next
 * password.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const codes = toCodeArray(input.trim());
  return [ findNextValidPassword(codes), findNextValidPassword(codes) ];
};

/**
 * Returns the next valid password after the one represented by the given array
 * of character codes.
 *
 * @param {Array<number>} codes - the current password's character codes
 * @returns {string} - the next password
 */
const findNextValidPassword = codes => {
  do {
    incrementAt(codes, codes.length - 1);
    incrementPastInvalidCodes(codes);
  } while (!hasThreeSequentials(codes) || !hasTwoDoubles(codes));

  return toPassword(codes);
};

/**
 * If this password contains any of the three invalid characters (`i`, `l`, or
 * `o`), this will iterate to the first password after it that doesn't contain
 * any of them. Note that the resulting password may still not be valid.
 *
 * @param {Array<number>} codes - the character codes of the password to check
 */
const incrementPastInvalidCodes = codes => {
  const index = codes.findIndex(code => INVALID_CHAR_CODES.includes(code));

  if (index !== -1) {
    incrementAt(codes, index);
    codes.fill(MIN_CHAR_CODE, index + 1);
  }
};

/**
 * Determines whether the password contains a three-character straight of
 * increasing characters.
 *
 * @param {Array<number>} codes - the character codes of the password to check
 * @returns {boolean} - whether the required straight was found
 */
const hasThreeSequentials = codes => {
  const limit = codes.length - 2;

  for (let i = 0; i < limit; i++) {
    const [ a, b, c ] = codes.slice(i, i + 3);

    if (a + 1 === b && b + 1 === c) {
      return true;
    }
  }

  return false;
};

/**
 * Determines whether the password contains two sets of adjacent doubled
 * characters.
 *
 * @param {Array<number>} codes - the character codes of the password to check
 * @returns {boolean} - whether the required straight was found
 */
const hasTwoDoubles = codes => {
  const limit = codes.length - 1;
  let count = 0;

  for (let i = 0; i < limit; i++) {
    if (codes[i] === codes[i + 1]) {
      count++;

      if (count === 2) {
        return true;
      }

      i++;
    }
  }

  return false;
};

/**
 * Increments the character at given index. If it rolls over from `z` back to
 * `a`, the character to its left will roll over as well, and so on.
 *
 * @param {Array<number>} codes - the character codes of the password
 * @param {number} index - the character index to increment
 */
const incrementAt = (codes, index) => {
  const val = codes[index];

  if (val === MAX_CHAR_CODE) {
    codes[index] = MIN_CHAR_CODE;

    if (index !== 0) {
      incrementAt(codes, index - 1);
    }
  } else {
    codes[index] = val + 1;
  }
};

/**
 * Converts the given password to an array of character codes.
 *
 * @param {string} password - the password to convert
 * @returns {Array<number>} - the character codes
 */
const toCodeArray = password => {
  const codes = [];

  for (let i = 0; i < password.length; i++) {
    codes.push(password.charCodeAt(i));
  }

  return codes;
};

/**
 * Converts an array of character codes to a string.
 *
 * @param {Array<number>} codes - the array of character codes
 * @returns {string} - the corresponding password
 */
const toPassword = codes => codes.map(code => String.fromCharCode(code)).join('');
