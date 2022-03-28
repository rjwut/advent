/**
 * # [Advent of Code 2016 Day 9](https://adventofcode.com/2016/day/9)
 *
 * For both parts, we don't actually have to create the decompressed string
 * (and doing so is prohibitively expensive for part two). Instead, we can
 * simply compute the length of the resulting string. For part two, the trick
 * is to make the function recursive, and pass along a multiplier value.
 * Implementation details are described in the documentation for the functions
 * for each part.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part of the puzzle to solve
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  input = input.trim();
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](input);
  }

  return parts.map(fn => fn(input));
};

/**
 * Compute the answer for part one:
 *
 * 1. Set `i` and `decompressed` to `0`.
 * 2. While `i` is less than the length of the input string:
 *    1. If the character at `i` is a `'('`:
 *       1. Find the index of the `')'` after `i`.
 *       2. Store the two numbers in the parentheses as `length` and `repeat`.
 *       3. Add `length * repeat` to `decompressed`.
 *       4. Set `i` to the index of the `')'` plus `length` plus `1`.
 *    2. Else:
 *       1. Find the index of the first `'('` after `i`.
 *       2. If it is not found, add the length of the string minus `i` to
 *          `decompressed` and exit the loop.
 *       3. Otherwise, add that index minus `i` to `decompressed`, and set `i`
 *          to the index of the `'('`.
 * 3. Return `decompressed`.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the decompressed length
 */
const part1 = input => {
  let i = 0;
  let decompressed = 0;

  while (i < input.length) {
    if (input[i] === '(') {
      const rightParenIndex = input.indexOf(')', i);
      const [ length, repeat ] = input.substring(i + 1, rightParenIndex).split('x').map(Number);
      decompressed += length * repeat;
      i = rightParenIndex + 1 + length;
    } else {
      const leftParenIndex = input.indexOf('(', i);

      if (leftParenIndex === -1) {
        decompressed += input.length - i;
        break;
      }

      decompressed += leftParenIndex - i;
      i = leftParenIndex;
    }
  }

  return decompressed;
};

/**
 * Compute the answer for part two. This solution is recursive, passing along
 * the accumulated multiplier value. By default, the entire string is parsed,
 * but on recursion the `start` and `end` indexes indicate the substring being
 * parsed.
 *
 * Algorithm:
 *
 * 1. Set `decompressed` to `0` and `i` to `start`.
 * 2. While `i` is less than `end`:
 *    1. If the character at `i` is `'('`:
 *       1. Find the index of the `')'` after `i`.
 *       2. Store the two numbers in the parentheses as `length` and `repeat`.
 *       3. Recurse with the following arguments:
 *          - `input`: `input`
 *          - `multiplier`: `multiplier * repeat`,
 *          - `start`: index of `'('` plus `1`
 *          - `end`: index of `'('` plus `length` plus `1`
 *       4. Add the return value from the recursion to `decompressed`.
 *       5. Set `i` to the value for `end` that was passed into the recursed
 *          function.
 *    2. Else:
 *       1. Find the index of the first `'('` after `i`; call it `endIndex`.
 *       2. If it is not found, or `endIndex` is after `end`, set `endIndex`
 *          equal to `end`.
 *       3. Add `(endIndex - i) * multiplier` to `decompressed`.
 *       4. Set `i` to `endIndex`.
 * 3. Return `decompressed`.
 *
 * @param {string} input - the puzzle input
 * @param {number} [multiplier=1] - the accumulated multiplier value
 * @param {number} [start=0] - the start of the substring to parse
 * @param {number} [end] - the end of the substring to parse (end of the string
 * if omitted)
 * @returns {number} - the decompressed length
 */
const part2 = (input, multiplier = 1, start = 0, end) => {
  end ??= input.length;
  let i = start;
  let decompressed = 0;

  while (i < end) {
    if (input[i] === '(') {
      const rightParenIndex = input.indexOf(')', i);
      const [ length, repeat ] = input.substring(i + 1, rightParenIndex).split('x').map(Number);
      let newStart = rightParenIndex + 1;
      let newEnd = newStart + length;
      decompressed += part2(input, multiplier * repeat, newStart, newEnd);
      i = newEnd;
    } else {
      let endIndex = input.indexOf('(', i);

      if (endIndex === -1 || endIndex > end) {
        endIndex = end;
      }

      decompressed += (endIndex - i) * multiplier;
      i = endIndex;
    }
  }

  return decompressed;
};
