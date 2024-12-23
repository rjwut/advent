const { split } = require('../util');
const Keypad = require('./day-21.keypad');
const Robot = require('./day-21.robot');

const NUMERIC_KEYPAD = '789\n456\n123\n 0A';
const DIRECTIONAL_KEYPAD = ' ^A\n<v>';

/**
 * # [Advent of Code 2024 Day 21](https://adventofcode.com/2024/day/21)
 *
 * I broke this problem down into three separate classes:
 *
 * ## `Keypad`
 *
 * This class accepts a string that describes the layout of the keys, and computes the optimal paths
 * from one key to another. Optimal paths can only have at most one bend in them, because more than
 * that causes robots upstream to have to move their fingers more to switch between keys. Where the
 * path does have a bend, there can be two possible optimal paths: move horizontally first, then
 * vertically, or vice versa. The exception is when one of those two paths would cause the robot's
 * finger to be over the gap at any time. In that case, the other path is the only acceptable one.
 * The `Keypad` class precomputes these paths and stores them in a `Map` for quick lookup.
 *
 * ## `Robot`
 *
 * This class keeps track of the current position of a robot's finger and determines the cost of
 * pressing a key. Each robot has a reference to a `Keypad` object that describes the keypad this
 * robot operates, and a reference to the next robot in the chain (closer to the door keypad). When
 * asked to press a key, the robot queries the `Keypad` object for the optimal path(s) to that key,
 * then recursively calls the next robot in the chain with those keystrokes. After determining the
 * cost of each path, it returns the minimum cost. The cost of a move from one key to another is
 * memoized in each `Robot` so that it is only computed once. This works because at any given time
 * that a `Robot` is asked to press a key, all downstream robots' fingers are currently over the `A`
 * key.
 *
 * ## `System`
 *
 * This class represents the entire chain of `Robot`s and is responsible for computing the total
 * cost of a code. At the beginning of each part of the puzzle, the `System` class is instantiated,
 * given the number of `Robot`s in the chain. The `System` class creates the chain of `Robot`
 * instances, then when asked to compute the cost of a code, it simply asks the head `Robot` to give
 * the cost of each keypress one at a type, then adds those costs and returns the sum.
 *
 * The solution function creates two `System` instances, one with three robots and one with
 * twenty-six, then iterates the codes and passes each one to each `System` instance to get the cost
 * of that code. It then computes the complexity by multiplying the cost by the number value of that
 * code, sums the complexities, and returns the result as the answer to the puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const codes = split(input);
  return [ 3, 26 ].map(robotCount => {
    const system = new System(robotCount);
    return codes.reduce((complexity, code) => {
      const cost = system.cost(code);
      const numCode = parseInt(code.substring(0, code.length - 1), 10);
      return complexity + cost * numCode;
    }, 0);
  });
};

/**
 * Represents the entire system of `Robot`s.
 */
class System {
  #head;

  /**
   * Creates a `System` with the given number of `Robot`s.
   *
   * @param {number} robotCount - the number of `Robot`s to create
   */
  constructor(robotCount) {
    // Create the keypads
    const numeric = new Keypad(NUMERIC_KEYPAD);
    const directional = new Keypad(DIRECTIONAL_KEYPAD);

    // Build the robots
    for (let i = 0; i < robotCount; i++) {
      const keypad = i + 1 === robotCount ? numeric : directional;
      this.#head = new Robot(keypad, this.#head);
    }
  }

  /**
   * Computes the cost of this code.
   *
   * @param {string} code - the code
   * @returns {number} - the cost of this code
   */
  cost(code) {
    let cost = 0;

    for (const key of code) {
      cost += this.#head.cost(key);
    }

    return cost;
  }
}
