const crypto = require('crypto');

const PASSWORD_LENGTH = 8;
const HASH_PREFIX = '00000';
const ASCII_0 = 48;

/**
 * # [Advent of Code 2016 Day 5](https://adventofcode.com/2016/day/5)
 *
 * Both parts are solved in a single pass, which is good because it takes a while. (After I solved
 * it, I hit up
 * [Reddit](https://www.reddit.com/r/adventofcode/comments/5gk2yv/2016_day_5_solutions/)
 * to see if there was some way that I could solve this without testing every index along the way.
 * The answer appears to be "no.") Each hash that it finds starts with `'00000'` is checked for both
 * passwords. The password for part one will never be found before the one for part two, so it
 * continues looping until the part two password is complete.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  let password1 = '', password2 = new Array(PASSWORD_LENGTH);
  let i = 0, password2CharsFound = 0, hash;

  do {
    hash = crypto.hash('md5', input + i++);

    if (!hash.startsWith(HASH_PREFIX)) {
      continue;
    }

    // Found a hash starting with `00000`
    const char5 = hash[5];

    if (password1.length !== PASSWORD_LENGTH) {
      // Found a character for part 1
      password1 += char5;
    }

    const pos = char5.charCodeAt(0) - ASCII_0;

    if (pos < PASSWORD_LENGTH && !password2[pos]) {
      // Found a character for part 2
      password2[pos] = hash[6];
      password2CharsFound++;
    }
  } while (password2CharsFound !== PASSWORD_LENGTH);

  return [ password1, password2.join('') ];
};
