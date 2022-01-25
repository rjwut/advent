/**
 * Contains the rule that determines whether a streak of duplicate digits is
 * valid for the password for the given part of the puzzle. Each function
 * expects to receive the length of the streak of repeated digits, and returns
 * whether that streak fulfills the rule. The password is valid if any streak
 * fulfills the rule.
 */
const STREAK_RULES = [
  streak => streak > 1,
  streak => streak === 2,
];

/**
 * This puzzle asks you to count the number of passwords that fulfill
 * particular criteria. The password must:
 *
 * - have six digits
 * - be found within a specified range
 * - have no digit that is smaller than the one to its left
 * - have at least one streak of consecutive matching digits of the correct
 *   length:
 *   - Part 1: two or more
 *   - Part 2: exactly two
 *
 * The brute force solution is, of course, to simply iterate all passwords in
 * the range, and count how many of them meet the criteria. I was considering a
 * "smarter" solution that would only iterate the values in the range that have
 * increasing digits, but I realized that would probably take a lot longer to
 * implement. It turned out that the brute force solution was fast enough.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const [ min, max ] = parseRanges(input);
  return STREAK_RULES.map(streakRule => countPasswords(min, max, streakRule));
};

/**
 * Parses the input in to an array containing the minimum and maximum values
 * for the valid password range.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the minimum and maximum values for the valid password
 */
const parseRanges = input => input.split('-')
  .map(part => parseInt(part, 10));

/**
 * Counts all the valid passwords within the given range, according to the
 * specified streak rule function.
 *
 * @param {number} min - the minimum value for the valid password range
 * @param {number} max - the maximum value for the valid password range
 * @param {Function} streakRule - the function that determines whether a streak
 * meets the criteria for the password
 * @returns {number} - the number of valid passwords within the given range
 */
  const countPasswords = (min, max, streakRule) => {
  let count = 0;

  for (let i = min; i <= max; i++) {
    if (isValid(i, streakRule)) {
      count++;
    }
  }

  return count;
};

/**
 * Determines whether the given password is valid according to the specified
 * streak rule. Also checks to make sure that the digits are in increasing
 * order.
 *
 * @param {number} password - the password to check
 * @param {Function} streakRule - the function that determines whether a streak
 * meets the criteria for the password
 * @returns {boolean} - whether the password is valid
 */
const isValid = (password, streakRule) => {
  const digits = [ ...password.toString() ]
  let prevDigit = digits[0];
  let streaks = [];
  let curStreak = 1;

  for (let i = 1; i < digits.length; i++) {
    const digit = digits[i];

    if (digit < prevDigit) {
      return false; // found a decrease; password is invalid
    }

    if (digit === prevDigit) {
      // Digit continues the current streak
      curStreak++;
    } else {
      // Streak is broken; store it and start a new streak
      streaks.push(curStreak);
      curStreak = 1;
    }

    prevDigit = digit;
  }

  streaks.push(curStreak);
  return streaks.some(streakRule); // Any streak matches the rule?
};
