const { match } = require('../util');
const z3 = require('z3-solver');

const MACHINE_REGEXP = /^\[(?<target>[.#]+)\](?<buttons>(?:\s\(\d+(?:,\d+)*\)+)+)\s\{(?<joltages>\d+(?:,\d+)+)\}$/gm;

let Context, em;

/**
 * # [Advent of Code 2025 Day 10](https://adventofcode.com/2025/day/10)
 *
 * ## Parsing
 *
 * It's convenient to use bit fields to store information for this simulation:
 *
 * - A bit field can store the configuration of lights on a machine. For example, `#.#..#` can be
 *   represented as `100101` in binary, which is equivalent to 37 in decimal.
 * - A bit field can store the behavior of an individual button, which each bit position set to `1`
 *   corresponds to a light to be toggled in part 1 and a joltage slot to be incremented in part 2.
 * - A bit field can store a combination of buttons to be pressed, where each bit position set to
 *   `1` corresponds to a button to be pressed.
 *
 * Thus, a machine can be represented as a target light configuration bit field, an array of button
 * bit fields, and an array of joltage slot counts. Consider the last machine in the example:
 *
 * ```txt
 * [.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}
 * ```
 *
 * ```js
 * {
 *   target: 46, // 101110
 *   buttons: [
 *     31, // 011111
 *     25, // 011001
 *     59, // 111011
 *     6,  // 000110
 *   ],
 *   joltages: [ 10, 11, 11, 5, 10, 5 ],
 * }
 * ```
 *
 * I used a regular expression to capture the three parts of the machine input, then converted them
 * into the data structure seen above, which is encapsulated in an immutable `Machine` class.
 *
 * ## Part 1
 *
 * Important observations:
 *
 * - To compute the resulting light configuration after pressing a set of buttons, simply XOR
 *   together the bit fields of the buttons that were pressed.
 * - Pressing a button a second time simply undoes the effect of the first press, so (at least for
 *   part 1) there is no reason to press a button more than once.
 *
 * We can then very easily try all possible button press combinations by iterating a value `n` from
 * `1` to `2 ** buttonCount - 1`. For each value of `n`, treat it like a bit field identifying the
 * buttons to be pressed. Convert each of those buttons to the corresponding bit field, and XOR all
 * the resulting bit fields together. This gives you a bit field representing the light
 * configuration resulting from pressing those buttons; if it matches the target, then count how
 * many `1` bits there are in `n` (the number of button presses). We are optimizing for fewest
 * button presses, so the result that produces the fewest button presses is the one we want. Repeat
 * this process for all machines and sum the results to get our answer.
 *
 * ## Part 2
 *
 * This part is more complicated, as now we will need to press buttons multiple times. The value of
 * a single joltage slot can be represented as a linear equation, where you add up the number of
 * times each button that increments that slot was pressed. Consider the example above:
 *
 * ```txt
 * j0 = b0 + b1 + b2
 * j1 = b0 +      b2 + b3
 * j2 = b0 +      b2 + b3
 * j3 = b0 + b1
 * j4 = b0 + b1 + b2
 * j5 =           b2
 * ```
 *
 * In the system of linear equations above, the value in joltage slot 0 is equal to the number of
 * times that button 0, button 1, or button 2 were pressed. After setting up this system, we wish to
 * optimize for the minimum value of `b0 + b1 + b2 + b3` (the total number of button presses).
 *
 * Against my preferences, I felt I had to resort to Z3 to solve this system. Documentation on the
 * JavaScript API is practically non-existent, but I did eventually discover the `Optimize` class in
 * the Z3 context which allows you to set up your system of equations and then search for a solution
 * which minimizes a particular value. I configured the system in Z3 as follows:
 *
 * - Button press counts (`b0`, `b1`, etc.) are non-negative integers.
 * - The value of a joltage slot (`j0`, `j1`, etc.) are known integer values that must be equal to
 *   the sum of the button press counts for all buttons that increment that slot.
 * - Minimize the sum of all button press counts.
 *
 * After letting Z3 solve the system, I extracted the button press counts from the model and summed
 * them to produce the minimum button presses for that machine. Repeating this for all machines and
 * summing the results gives the answer for part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async input => {
  // Set up Z3
  const z3Ready = await z3.init();
  Context = z3Ready.Context;
  em = z3Ready.em;

  const machines = Machine.parseAll(input);
  let answers = [ 0, 0 ];

  for (const machine of machines) {
    answers[0] += machine.tryAllPushCombinations();
    answers[1] += await machine.solveJoltages();
  }

  return answers;
};

/**
 * A stateless object representing a single machine.
 */
class Machine {
  static parseAll(input) {
    return match(input, MACHINE_REGEXP).map(m => new Machine(m));
  }

  #buttons;
  #joltages;
  #target;

  /**
   * Creates a new `Machine` from a regular expression match object.
   *
   * @param {Object} param0 - the match object
   * @param {string} param0.target - the target light configuration (e.g. `'.##.'`)
   * @param {string} param0.buttons - the button definitions (e.g. `'(0,2) (1,3)'`)
   * @param {string} param0.joltages - the target joltages (e.g. `'1,2,3'`)
   */
  constructor({ target, buttons, joltages }) {
    this.#buttons = parseButtons(buttons);
    this.#joltages = joltages.split(',').map(Number);
    this.#target = parseTarget(target);
  }

  /**
   * Computes the minimum number of button pushes required to reach the target light configuration.
   *
   * @returns {number} - the minimum number of button pushes
   */
  tryAllPushCombinations() {
    // Try all possible button push combinations
    const max = 2 ** this.#buttons.length;
    let bestCost = Infinity;

    for (let i = 0; i < max; i++) {
      let lights = 0;

      for (let j = 0; j < this.#buttons.length; j++) {
        if (i & (1 << j)) {
          lights ^= this.#buttons[j];
        }
      }

      if (lights === this.#target) {
        // The light configuration is correct; compare against best found so far
        bestCost = Math.min(bestCost, countOnBits(i));
      }
    }

    return bestCost;
  }

  /**
   * Computes the minimum number of button pushes required to reach the target joltages.
   *
   * @returns {number} - the minimum number of button pushes
   */
  async solveJoltages() {
    const ctx = new Context('main');
    const { Int, Optimize } = ctx;
    const optimizer = new Optimize();

    // The number times each button is pressed (what we're trying to find)
    const buttonPressVariables = this.#buttons.map((_, i) => {
      const variable = Int.const(`b${i}`);
      optimizer.add(variable.ge(Int.val(0))); // non-negative
      return variable;
    });

    // Joltage variables
    const joltageVars = this.#joltages.map((joltage, i) => {
      const variable = Int.const(`j${i}`);
      optimizer.add(variable.eq(joltage)); // equal to target joltage
      return variable;
    });

    // Joltage value equals number of times any button that increments it is pressed
    for (let i = 0; i < this.#joltages.length; i++) {
      let joltageSlotSum;

      for (let j = 0; j < this.#buttons.length; j++) {
        if (this.#buttons[j] & (1 << i)) {
          const variable = buttonPressVariables[j];

          if (joltageSlotSum) {
            joltageSlotSum = joltageSlotSum.add(variable);
          } else {
            joltageSlotSum = variable;
          }
        }
      }

      const joltageVar = joltageVars[i];
      optimizer.add(joltageVar.eq(joltageSlotSum));
    }

    let buttonPresses;
    buttonPressVariables.forEach((variable, i) => {
      if (i === 0) {
        buttonPresses = variable;
      } else {
        buttonPresses = buttonPresses.add(variable);
      }
    });
    optimizer.minimize(buttonPresses);
    await optimizer.check();
    em.PThread.terminateAllThreads(); // https://github.com/Z3Prover/z3/issues/6701
    const result = buttonPressVariables.map(
      variable => Number(optimizer.model().get(variable).toString())
    );
    return result.reduce((acc, val) => acc + val, 0);
  }
}

/**
 * Parses a light configuration string (e.g. `'.##.'`) into a bit field.
 *
 * @param {string} targetStr - the light configuration string
 * @returns {number} - the bit field representing the light configuration
 */
const parseTarget = targetStr => [ ...targetStr ].reduce(
  (acc, light, i) => acc | (light === '#' ? (1 << i) : 0), 0
);

/**
 * Parses an array of button definition strings (e.g. `'(0,2) (1,3)'`) into an array of bit fields.
 *
 * @param {string} buttonsStr - the button definition strings
 * @returns {number[]} - the array of bit fields representing the button definitions
 */
const parseButtons = buttonsStr => buttonsStr.trim().split(' ').map(
  b => b
    .slice(1, -1)
    .split(',')
    .map(Number)
    .reduce((acc, val) => acc | (1 << val), 0)
);

/**
 * Counts the number of bits in the given bit field that are on.
 *
 * @param {number} n - the bit field
 * @returns {number} - how many bits are turned on
 */
const countOnBits = n => {
  let count = 0;

  while (n) {
    count += n & 1;
    n >>= 1;
  }

  return count;
};
