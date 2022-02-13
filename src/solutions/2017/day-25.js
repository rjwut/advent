const { match } = require('../util');

const INTRO_REGEXP = /^Begin in state (?<startState>\w)\.\s+Perform a diagnostic checksum after (?<steps>\d+) steps\./;
const STATE_REGEXP = /If the current value is \d:\s+- Write the value (?<write>\d)\.\s+- Move one slot to the (?<dir>left|right)\.\s+- Continue with state (?<state>\w)\./g;

/**
 * # [Advent of Code 2017 Day 25](https://adventofcode.com/2017/day/25)
 *
 * The hardest part was parsing the input. I created two regular expressions:
 * one to capture the starting state and the number of steps to execute, and
 * another to capture the rule for combination of current state and value. Note
 * that the input lists the states in alphabetical order, and rule for value
 * `0` before value `1`; this predictability simplified the rule parser.
 *
 * I also created a `Tape` class that represented the tape as a doubly-linked
 * list, with the ability to automatically extend the tape if we move past
 * either end of it. I also kept track of the checksum as we go: it starts at
 * `0`, is incremented if a `0` is changed to a `1`, and decremented if a `1`
 * is changed to a `0`.
 *
 * With that in place, the solution is straightforward: Create a `Tape`
 * instance, loop the number of times indicated in the input. With each loop,
 * look up the rule for the current state and value. Write the indicated value
 * to the `Tape`, move the `Tape`, and update the state. At the end, the
 * `Tape`'s checksum is the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const rules = parse(input);
  const tape = new Tape();
  let state = rules.startState;

  for (let step = 0; step < rules.steps; step++) {
    const rule = rules.states[state][tape.value];
    tape.value = rule.write;
    tape.move(rule.dir);
    state = rule.state;
  }

  return [ tape.checksum, undefined ];
};

/**
 * Parses the input into an object describing the Turing machine rules:
 *
 * - `startState` (string): The state to start in
 * - `steps` (number): The number of steps to execute
 * - `states` (Object): The possible states. Each key is the name of a state,
 *   and the value is an array with two rule objects in it: the index of the
 *   rule object corresponds to the current tape value to which it applies:
 *   - `write` (number): The value to write to the tape
 *   - `dir` (number): The direction to move the tape (`-1` for left or `1` for
 *     right)
 *   - `state` (string): The new state when this rule ends
 *
 * @param {string} input - the puzzle input 
 * @returns {Object} - the parsed rules
 */
const parse = input => {
  const rules = {
    ...input.match(INTRO_REGEXP).groups,
    states: {},
  };
  rules.steps = parseInt(rules.steps, 10);
  const stateRules = match(input, STATE_REGEXP, {
    write: Number,
    dir: dir => dir === 'left' ? -1 : 1,
  });

  for (let i = 0; i < stateRules.length; i += 2) {
    const state = String.fromCharCode((i / 2) + 65);
    rules.states[state] = [ stateRules[i], stateRules[i + 1] ];
  }

  return rules;
};

/**
 * Represents the Turing machine's tape. It is an infinite doubly-linked list.
 * It is infinite because if asked to move past the end of the tape, it will
 * be extended automatically. The `Tape` is also responsible for keeping track
 * of the checksum.
 */
class Tape {
  #node;
  #checksum = 0;

  /**
   * Creates a new `Tape`.
   */
  constructor() {
    this.#node = {
      value: 0,
      left: null,
      right: null,
    }
  }

  /**
   * Reports the value stored at the `Tape`'s current position.
   *
   * @returns {number} - the value at the current position
   */
  get value() {
    return this.#node.value;
  }

  /**
   * Sets the value at the `Tape`'s current position.
   *
   * @param {number} value - the value to set
   */
  set value(value) {
    this.#checksum += value - this.#node.value;
    this.#node.value = value;
  }

  /**
   * Reports the `Tape`'s checksum.
   *
   * @returns {number} - the checksum
   */
  get checksum() {
    return this.#checksum;
  }

  /**
   * Moves one slot to the left or right, depending on the argument's sign.
   *
   * @param {number} dir - the direction to move (negative for left, positive for right)
   */
  move(dir) {
    let next = this.#node;

    if (dir < 0) {
      next = this.#node.left;

      if (!next) {
        next = {
          value: 0,
          left: null,
          right: this.#node,
        };
        this.#node.left = next;
      }
    } else if (dir > 0) {
      next = this.#node.right;

      if (!next) {
        next = {
          value: 0,
          left: this.#node,
          right: null,
        }
        this.#node.right = next;
      }
    }

    this.#node = next;
  }
}
