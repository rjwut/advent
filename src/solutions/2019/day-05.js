const intcode = require('./intcode');

/**
 * This day's puzzle takes the Intcode interpreter from day 2 and adds some
 * more functionality. Part one introduces the following new opcodes:
 *
 * - `3`: Accepts an input value from the user, then stores it in the address
 *   given in its parameter.
 * - `4`: Outputs the value at the given address to the user.
 *
 * It also introduces the concept of _parameter modes_. When reading a memory
 * location as an opcode, only the tens and ones digits are used. Other digits
 * are used to specify the mode of each parameter. The hundreds digit stores
 * the mode for the first parameter, the thousands digit for the second, and so
 * on. If the mode is `0`, the parameter is interpreted as a position, as has
 * been done so far, and the requested value is read from that position. If the
 * mode is `1`, the parameter is interpreted as a value and is used directly.
 * If an opcode indicates that a value is to be stored in memory, the parameter
 * is always interpreted as a position (i.e., the value will be stored in that
 * address), regardless of the specified parameter mode.
 *
 * Once that functionality is in place, we run the program given in the puzzle
 * input, and supply the Intcode interpreter with a `1` as the input value. If
 * the program runs correctly, it will output a series of `0` values, followed
 * by a diagnostic code. The code is our puzzle answer.
 *
 * Part two introduces four new opcodes:
 * 
 * - `5`: If the first parameter is non-zero, move the instruction pointer to
 *   the address given by the second parameter. Otherwise, do nothing. Note
 *   that the target address can be specified in either mode. (Mode `0` means
 *   to look up the address given in the parameter, and jump to the address
 *   stored there. Mode `1` means jump to the address specified in the
 *   parameter.)
 * - `6`: Same as `5`, but jump if the first parameter is zero instead of
 *   non-zero.
 * - `7`: If the first parameter is less than the second parameter, store a `1`
 *   at the address given by the third paramter. Otherwise, store a `0` at that
 *   address.
 * - `8`: Same as `7`, but stores `1` if the first two parameters are equal and
 *   `0` otherwise.
 *
 * This time, we must give `5` as the input value, and we will get a single
 * output value back: the puzzle answer.
 *
 * To simplify automation, rather than prompt the user for input, we will
 * provide input as an array of integers that we specify in the Intcode
 * options. Output is provided as an array of integers in the result object
 * returned by the Intcode interpreter.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
 module.exports = input => [ part1, part2 ].map(fn => fn(input));

const part1 = program => {
  const { state, api } = intcode(program);
  api.input(1);
  api.run();
  return state.output[state.output.length - 1];
};

const part2 = program => {
  const { state, api } = intcode(program);
  api.input(5);
  api.run();
  return state.output[0];
};
