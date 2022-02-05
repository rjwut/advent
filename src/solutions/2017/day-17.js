const CircularLinkedList = require('../circular-linked-list');

const MAX_VALUE_1 = 2017;
const MAX_VALUE_2 = 50_000_000;

/**
 * # [Advent of Code 2017 Day 17](https://adventofcode.com/2017/day/17)
 *
 * Part one can be computed easily leveraging our existing `CircularLinkedList`
 * class. It even already optimizes the `rotate()` method for offsets that are
 * larger than the list's length, making it run pretty fast.
 *
 * This approach doesn't work for part two, because the list quickly grows to
 * be much larger than the offset, resulting in `rotate()` calls becoming slow.
 * However, the fact that we now need to know the value that is at a specific
 * position instead of immediately after the current position makes it so that
 * we no longer have to actually store the entire buffer anymore. All we need
 * to know is: the most recently inserted value (which is one less than the
 * length of the list), the current position, and the value that is currently
 * at position 1. For each step, we update the current position, and if it
 * results in a new value being written to position 1, we track that new value.
 * This is much faster because we aren't creating nodes and inserting them into
 * the list, and rotations are performed with one simple calculation instead of
 * navigating to new nodes a large number of times. We just repeat that until
 * we insert the value `50,000,000`, at which point the value we've currently
 * got tracked for position 1 is the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const forwardSteps = parseInt(input.trim(), 10);
  return [ part1, part2 ].map(fn => fn(forwardSteps));
};

/**
 * Computes the answer to part one. For this part, we simulate the buffer as
 * described in the puzzle description.
 *
 * @param {number} forwardSteps - the number of steps to move forward each time
 * @returns {number} - the answer to part one
 */
const part1 = forwardSteps => {
  const buffer = new CircularLinkedList([ 0 ]);
  let lastInsert = 0;

  do {
    buffer.rotate(forwardSteps);
    buffer.insertAfter(++lastInsert);
  } while (lastInsert !== MAX_VALUE_1);

  buffer.rotate(1);
  return buffer.peek();
};

/**
 * Computes the answer to part two. Simulating the entire buffer is too slow
 * for this part, but we only need the value at a position 1, so we don't
 * actually have to simulate it anymore.
 *
 * @param {number} forwardSteps - the number of steps to move forward each time
 * @returns {number} - the answer to part two
 */
const part2 = forwardSteps => {
  let length = 2;
  let pos = 1;
  let valueAtPos1 = 1;

  do {
    pos = (pos + forwardSteps) % length;

    if (pos === 0) {
      valueAtPos1 = length;
    }

    pos++;
  } while (length++ !== MAX_VALUE_2);

  return valueAtPos1;
};
