/**
 * # [Advent of Code 2025 Day 2](https://adventofcode.com/2025/day/2)
 *
 * In both parts of the puzzle, invalid IDs consist of a sequence of digits repeated at least twice,
 * with no other digits. In part 1, only those that are repeated exactly twice are invalid, while in
 * part 2, sequences repeated more than twice are also invalid. We will consider only part 2 for
 * now, since if you can compute part 2, you can get part 1 by filtering the results.
 *
 * Parsing is straightforward: split the input on commas to get range strings, split those on dashes
 * to get min and max values, and convert those to numbers.
 *
 * For any given ID of at least two digits, the possible subsequence lengths are 1 through half the
 * length of the ID (rounded down). For each possible length, we first confirm whether that length
 * divides evenly into the length of the ID, skipping it if not. Otherwise, we produce a string that
 * is the subsequence repeated to match the ID's length, then compare that to the ID. If they match,
 * the ID is invalid.
 *
 * I wrote a `computeRepetitions()` function that implements this, and if an ID is found to be
 * invalid, it returns the number of repetitions of the subsequence that caused the match. Since we
 * want to find IDs with exactly two repetitions for part 1, we check for the largest possible
 * subsequence length first and iterate backwards to length 1, and return the number of repetitions
 * as soon as we find a match. If the ID is valid, `computeRepetitions()` returns `0`.
 *
 * Then we simply iterate through all the values in all the ranges and test them with
 * `computeRepetitions()`. For all that return a non-zero value, we add the ID to the part 2 sum. If
 * the number of repetitions is exactly `2`, we also add it to the part 1 sum. After iterating all
 * values, we have the answers for both parts.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const ranges = parse(input);
  const sums = [ 0, 0 ];
  ranges.forEach(({ min, max }) => {
    for (let id = min; id <= max; id++) {
      const idStr = String(id);
      const repetitions = computeRepetitions(idStr);

      if (repetitions !== 0) {
        sums[1] += id;

        if (repetitions === 2) {
          sums[0] += id;
        }
      }
    }
  });
  return sums;
};

/**
 * Parses the input string into an array of range objects. Each range object has integer `min` and
 * `max` properties.
 *
 * @param {string} input - the puzzle input
 * @returns {object[]} - an array of range objects
 */
const parse = input => {
  return input.trim().split(',').map(range => {
    const [ min, max ] = range.split('-').map(Number);
    return { min, max };
  });
};

/**
 * If the given ID consists only of a subsequence of digits repeated at least twice with no other
 * digits, this function returns the number of times that subsequence is repeated. Otherwise, it
 * returns `0`. If more than one subsequence could match, the longest one is used.
 *
 * @param {string} id - the ID to check
 * @returns {number} - the number of subsequence repetitions in the ID
 */
const computeRepetitions = id => {
  const maxLength = Math.floor(id.length / 2);

  for (let length = maxLength; length > 0; length--) {
    if (id.length % length !== 0) {
      continue;
    }

    const repetitions = id.length / length;
    const sequence = id.substring(0, length);

    if (id === sequence.repeat(repetitions)) {
      return repetitions;
    }
  }

  return 0;
};
