const { add } = require('../math2');

/**
 * # [Advent of Code 2023 Day 15](https://adventofcode.com/2023/day/15)
 *
 * Compared to recent puzzles, this one was a breather. There's no real trick to this one, you just
 * need to make sure you follow the steps exactly.
 *
 * ## Part 1
 *
 * Simply hash east step and sum the hashes.
 *
 * ## Part 2
 *
 * To keep things organized, I created three classes:
 *
 * - `Lens`: Parses lenses and computes their hashes.
 * - `Box`: Manages the `Lens`es inside them and compute their focusing power. This uses a `Map` to
 *   store the `Lens`es because it preserves insertion order and so fulfills the requirement on
 *   lens order given by the puzzle.
 * - `Boxes`: Looks up `Box`es and aggregates their focusing power.
 *
 * Iterate the steps: If a step ends with a `-`, strip it off and compute the hash of the remaining
 * string (the label). Then retrieve that `Box` and remove any `Lens` with that label. Otherwise,
 * feed the step to the `Lens` constructor, then retrieve the `Box` for that hash and add the
 * `Lens` to it. Finally, sum the focusing power of each `Box`. Each `Box` computes its focusing
 * power by summing the focusing power of the individual `Lens`es inside it, according to the
 * instructions in the puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const steps = input.trim().split(',');
  return [
    add(steps.map(hash)),
    buildBoxes(steps).focusingPower,
  ];
};

/**
 * Hashes the given string.
 *
 * @param {string} string - the string to hash
 * @returns {number} - the hash
 */
const hash = string => {
  let value = 0;

  for (let i = 0; i < string.length; i++) {
    value = ((value + string.charCodeAt(i)) * 17) % 256;
  }

  return value;
};

/**
 * Creates a `Boxes` instance and runs the given steps on it.
 *
 * @param {Array<string>} steps - the steps to run
 * @returns {Boxes} - a populated `Boxes` instance
 */
const buildBoxes = steps => {
  const boxes = new Boxes();
  steps.forEach(step => {
    if (step.endsWith('-')) {
      boxes.remove(step.slice(0, -1));
    } else {
      boxes.add(new Lens(step));
    }
  });
  return boxes;
}

/**
 * A single `Lens`.
 */
class Lens {
  constructor(string) {
    const parts = string.split('=');
    this.label = parts[0];
    this.hash = hash(this.label);
    this.focalLength = Number(parts[1]);
  }
}

/**
 * A single `Box` that contains `Lens`es.
 */
class Box {
  #index;
  #lenses;

  /**
   * Creates a `Box` with the given index.
   *
   * @param {number} index - the `Box` index
   */
  constructor(index) {
    this.#index = index;
    this.#lenses = new Map();
  }

  /**
   * @returns {number} - the focusing power of all `Lens`es in this `Box`
   */
  get focusingPower() {
    return [ ...this.#lenses.values() ].reduce((power, lens, lensIndex) => {
      const lensPower = (this.#index + 1) * (lensIndex + 1) * lens.focalLength;
      return power + lensPower;
    }, 0);
  }

  /**
   * Adds the given `Lens` to this `Box`.
   *
   * @param {Lens} lens - the `Lens` to add
   */
  add(lens) {
    this.#lenses.set(lens.label, lens);
  }

  /**
   * Removes the `Lens` with the given label from this `Box`.
   *
   * @param {string} label - the label
   */
  remove(label) {
    this.#lenses.delete(label);
  }
}

/**
 * Contains all the `Box` objects.
 */
class Boxes {
  #boxes;

  /**
   * Creates all the `Box`es.
   */
  constructor() {
    this.#boxes = new Array(256);

    for (let i = 0; i < 256; i++) {
      this.#boxes[i] = new Box(i);
    }
  }

  /**
   * @returns {number} - the focusing power of all `Box`es
   */
  get focusingPower() {
    return this.#boxes.reduce((power, box) => power + box.focusingPower, 0);
  }

  /**
   * Adds the given `Lens` to the appropriate `Box`.
   *
   * @param {Lens} lens - the `Lens` to add
   */
  add(lens) {
    this.#boxes[lens.hash].add(lens);
  }

  /**
   * Removes the `Lens` with the given label from the appropriate `Box`.
   *
   * @param {string} label - the label of the `Lens` to remove
   */
  remove(label) {
    this.#boxes[hash(label)].remove(label);
  }
}
