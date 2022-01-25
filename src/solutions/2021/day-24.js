const { split } = require('../util');

const MODEL_NUMBER_LENGTH = 14;
const CONSTANT_LOCATIONS = [ 5, 15 ];

/**
 * # [Advent of Code 2021 Day 24](https://adventofcode.com/2021/day/24)
 *
 * ## Reverse Engineering the MONAD Source Code
 *
 * As usual, brute force will take much too long. An inspection of the MONAD
 * source code reveals that the program is composed of 14 near-identical
 * copies of the same subroutine, with only three constants different in each
 * one. The subroutine looks like this:
 *
 * ```
 * inp w
 * mul x 0
 * add x z
 * mod x 26
 * div z <constant1>
 * add x <constant2>
 * eql x w
 * eql x 0
 * mul y 0
 * add y 25
 * mul y x
 * add y 1
 * mul z y
 * mul y 0
 * add y w
 * add y <constant3>
 * mul y x
 * add z y
 * ```
 *
 * The first constant is always one of two values: `1` if the second constant
 * is positive, and `26` if it is negative. We'll refer to the second constant
 * as `check`, and the third as `offset`. The values of `w`, `x`, and `y` all
 * get reset before use, meaning that only `z` carries over from the previous
 * execution of the subroutine. If you were to convert the MONAD code to
 * JavaScript, simplify it, and wrap it in a function, it would look something
 * like this:
 *
 * ```js
 * const subroutine = (input, z, check, offset) => {
 *   if (check < 0) {
 *     z = Math.trunc(z / 26);
 *   }
 *
 *   if (input !== z % 26 + check) {
 *     z = z * 26 + input + offset;
 *   }
 *
 *   return z;
 * };
 * ```
 *
 * - When `check` is positive, it's always `10` or higher. This means that
 *   `input`, which is always a value between `1` and `9` inclusive, can never
 *   be high enough to satisfy the condition `input === z % 26 + check` when
 *   `check` is positive.
 * - When `check` is negative, the value of `z` is reduced by a factor of `26`.
 * - For seven of the digits in the model number, `check` is positive, while
 *   it's negative for the other seven.
 * - If `input` doesn't satisfy the condition, `z` is increased by a factor of
 *   `26` and then `input` and `offset` are added in.
 *
 * Base 10 numbers can be thought of as a stack of digits. If you multiply by
 * 10 and then add a digit, you've effectively pushed the digit onto the stack.
 * If you divide by 10 and round down, you popped a digit off the stack. The
 * `z` variable is essentially the same, but in base 26. When `check` is
 * negative, a value is popped off the stack. When `input` doesn't satisfy the
 * condition `input === z % 26 + check`, `input + offset` is pushed onto the
 * stack. (This always happens when `check` is positive, since no legal value
 * of `input` can satisfy the condition.)
 *
 * So the trick is to select `input` when `check` is positive to influence what
 * numbers are pushed onto the stack, and to avoid having a new value pushed
 * when `check` is negative.
 *
 * ## Finding the Model Number
 *
 * Here are the `check` and `offset` values for my input:
 *
 * |  # | `check` | `offset` |
 * | -: | ------: | -------: |
 * |  0 |      15 |       15 |
 * |  1 |      15 |       10 |
 * |  2 |      12 |        2 |
 * |  3 |      13 |       16 |
 * |  4 |     -12 |       12 |
 * |  5 |      10 |       11 |
 * |  6 |      -9 |        5 |
 * |  7 |      14 |       16 |
 * |  8 |      13 |        6 |
 * |  9 |     -14 |       15 |
 * | 10 |     -11 |        3 |
 * | 11 |      -2 |       12 |
 * | 12 |     -16 |       10 |
 * | 13 |     -14 |       13 |
 *
 * We need to ensure that every time `check` is negative, `input` satisfies the
 * condition so that a new value isn't pushed onto the stack. This will result
 * in seven pushes and seven pops, so that the stack will be empty at the end
 * (`z = 0`). The pops occur at indexes `4`, `6`, `9`, `10`, `11`, `12`, and
 * `13`.
 *
 * The correct value for `input[i]` where `check[i]` is negative is:
 *
 * ```
 * input[i] = input[p] + offset[p] + check[i]
 * ```
 *
 * ...where `p` is the index where `input[p] + offset[p]` was pushed onto the
 * stack. You can also solve for `input[p]`:
 *
 * ```
 * input[p] = input[i] - offset[p] - check[i]
 * ```
 *
 * This may produce a value which is out of range of the valid `input` values.
 * If so, we simply adjust both `input` numbers by the same amount until they
 * are in range.
 *
 * For part one, we want the `input` values to be as high as possible, so we
 * set `input[i] = 9` and solve for `input[p]`. If this makes `input[p]`
 * greater than `9`, we subtract `input[p] - 9` from both `input` values to
 * bring it in range.
 *
 * For part two, we want the lowest possible `input` values. In this scenario,
 * we set `input[p] = 1` and solve for `input[i]`. If this makes `input[i]`
 * less than `1`, we add `1 - input[i]` to both `input` values.
 *
 * Let's try it for `i = 4` and `p = 3`. For part one:
 *
 * ```
 * input[3] = input[4] - offset[3] - check[4]
 *          = 9 - 16 + 12
 *          = 5
 * ```
 *
 * And part two:
 *
 * ```
 * input[4] = input[3] + offset[3] + check[4]
 *          = 1 + 16 - 12
 *          = 5
 * ```
 *
 * Repeat for the remaining pops:
 *
 * - `i = 6`, `p = 5`
 * - `i = 9`, `p = 8`
 * - `i = 10`, `p = 7`
 * - `i = 11`, `p = 2`
 * - `i = 12`, `p = 1`
 * - `i = 13`, `p = 0`
 *
 * The `i = 9`, `p = 8` case is the first one that requires adjustment to stay
 * in the `input` range. For part one:
 *
 * ```
 * input[9] = 9
 * input[8] = input[9] - offset[8] - check[9]
 *          = 9 - 6 + 14
 *          = 17 (too high)
 * 17 - 9 = 8
 * input[8] = 17 - 8
 *          = 9
 * input[9] = 9 - 8
 *          = 1
 * ```
 *
 * And part two:
 *
 * ```
 * input[8] = 1
 * input[9] = input[8] + offset[8] + check[9]
 *          = 1 + 6 - 14
 *          = -7 (too low)
 * 1 + 7 = 8
 * input[8] = 1 + 8
 *          = 9
 * input[9] = -7 + 8
 *          = 1
 * ```
 *
 * Results:
 *
 * |  # | `check` | `offset` | high | low |
 * | -: | ------: | -------: | ---: | --: |
 * |  0 |      15 |       15 |    8 |   1 |
 * |  1 |      15 |       10 |    9 |   7 |
 * |  2 |      12 |        2 |    9 |   1 |
 * |  3 |      13 |       16 |    5 |   1 |
 * |  4 |     -12 |       12 |    9 |   5 |
 * |  5 |      10 |       11 |    7 |   1 |
 * |  6 |      -9 |        5 |    9 |   3 |
 * |  7 |      14 |       16 |    4 |   1 |
 * |  8 |      13 |        6 |    9 |   9 |
 * |  9 |     -14 |       15 |    1 |   1 |
 * | 10 |     -11 |        3 |    9 |   6 |
 * | 11 |      -2 |       12 |    9 |   1 |
 * | 12 |     -16 |       10 |    3 |   1 |
 * | 13 |     -14 |       13 |    9 |   2 |
 *
 * So the part one answer for my input is `89959794919939` and the part two
 * answer is `17115131916112`.
 *
 * @param {string} source - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = source => {
  const constants = extractSubroutineConstants(source);
  const popToPushMap = computePopToPushMap(constants);
  const input = [
    new Array(MODEL_NUMBER_LENGTH),
    new Array(MODEL_NUMBER_LENGTH),
  ];
  const check = index => constants[index][0];
  const offset = index => constants[index][1];

  for (let [ pop, push ] of popToPushMap) {
    // Part one
    input[0][push] = 9 - offset(push) - check(pop);
    input[0][pop] = 9;

    if (input[0][push] > 9) { // adjust to be in input range
      const subtract = input[0][push] - 9;
      input[0][push] -= subtract;
      input[0][pop] -= subtract;
    }

    // Part two
    input[1][push] = 1;
    input[1][pop] = 1 + offset(push) + check(pop);

    if (input[1][pop] < 1) { // adjust to be in input range
      const add = 1 - input[1][pop];
      input[1][push] += add;
      input[1][pop] += add;
    }
  }

  return input.map(digits => digits.join(''));
};

/**
 * The MONAD source consists of 14 subroutines, each of which is identical
 * except for three constants. The first constant, located on line 5 of the
 * subroutine, is computed based on the second constant, so we can ignore it.
 * The second constant, located on line 6, is the `check` value. The third is
 * the `offset` value, located on line 15. They are each the last term on their
 * respective lines.
 *
 * This function extracts the `check` and `offset` constants from the source
 * code. The returned array has 14 elements, one for each subroutine. Each
 * element is itself an array, containing the `check` and `offset` constants in
 * that order.
 *
 * @param {string} source - the MONAD source
 * @returns {Array} - an array of the constants
 */
const extractSubroutineConstants = source => {
  const lines = split(source.trim());
  const linesPerSubroutine = lines.length / MODEL_NUMBER_LENGTH;
  const constants = [];

  for (let i = 0; i < MODEL_NUMBER_LENGTH; i++) {
    const start = i * linesPerSubroutine;
    constants.push(CONSTANT_LOCATIONS.map(location => {
      const tokens = lines[start + location].split(' ');
      return parseInt(tokens[2], 10);
    }));
  }

  return constants;
};

/**
 * Produces a `Map` whose keys are indexes where values are popped, and stores
 * under each one the index where the popped value was pushed. This can be used
 * to look up when a value was pushed from its pop index.
 *
 * @param {Array} constants - the extracted subroutine constants
 * @returns {Map} - the pop-to-push `Map`
 */
const computePopToPushMap = constants => {
  const pushIndexes = [];
  return constants.reduce((popToPush, [ check ], i) => {
    if (check > 0) { // push
      pushIndexes.push(i);
    } else { // pop
      popToPush.set(i, pushIndexes.pop());
    }

    return popToPush;
  }, new Map());
};
