const REGEXES = [ /^(\d+)\1$/, /^(\d+)\1+$/ ];

/**
 * # [Advent of Code 2025 Day 2](https://adventofcode.com/2025/day/2)
 *
 * In both parts of the puzzle, invalid IDs consist of a sequence of digits repeated at least twice,
 * with no other digits. We can use regular expression lookbehinds to match IDs that consist of a
 * repeated sequence of digits. (Credit to Ryan Horrocks for reminding me that lookbehinds are a
 * thing! I had used a couple of different approaches before this, but this was faster.)
 *
 * For part 1, we want to match IDs that consist of a sequence of digits repeated exactly twice. The
 * following regular expression `/^(\d+)\1$/` accomplishes this:
 *
 * - `^` matches the start of the string
 * - `(\d+)` matches and captures a sequence of one or more digits
 * - `\1` matches the same sequence again
 * - `$` matches the end of the string
 *
 * Only IDs that consist of exactly two repetitions of the same sequence will match this regex.
 *
 * For part 2, we want to allow more than two repetitions of the sequence. That can be accomplished
 * simply by adding the `+` quantifier to the lookbehind, like so: `/^(\d+)\1+$/`. Now it will match
 * as many times as needed to consume the entire string, as long as there are at least two
 * repetitions.
 *
 * For each part of the puzzle, we iterate over all the values in all the ranges and test them
 * against the appropriate regular expression for that part. If the ID matches, it's invalid, and we
 * add it to the sum for that part. After iterating all values, the sum is the answer for that part.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  // Parse input into an array of range objects
  const ranges = input.trim().split(',').map(range => {
    const [min, max] = range.split('-').map(Number);
    return { min, max };
  });

  // Iterate over the regular expressions for each part
  return REGEXES.map(regexp => {
    let sum = 0;
    // Iterate ranges
    ranges.forEach(({ min, max }) => {
      // Iterate values in each range
      for (let id = min; id <= max; id++) {
        // Test ID against regular expression
        if (regexp.test(String(id))) {
          sum += id; // add invalid ID to sum
        }
      }
    });
    return sum;
  });
};
