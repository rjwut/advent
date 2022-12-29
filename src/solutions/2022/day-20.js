const { split } = require('../util');
const { add } = require('../math2');
const CircularLinkedList = require('../circular-linked-list');

const DECRYPTION_KEY = 811589153;

/**
 * # [Advent of Code 2022 Day 20](https://adventofcode.com/2022/day/20)
 *
 * This one was something of a breather after the previous few. My existing `CircularLinkedList`
 * class was super handy for this.
 *
 * The `mix()` function I wrote accepts three arguments:
 *
 * - the parsed array of input numbers
 * - the decryption key (`1` for part one, `811589153` for part two)
 * - the number of times to perform the mixing (`1` for part one, `10` for part two)
 *
 * After multiplying each value in the array by the encryption key, they're loaded into the
 * `CircularLinkedList`. Then I created a pointer for each one at their initial position: pointer
 * `0` for the zeroeth element, then pointer `1`, pointer `2`, and so on. `CircularLinkedList`
 * keeps these pointers together with their elements even as they shift around, which makes it
 * easy for me to move any element on demand. As I added the pointers, I noted the location of the
 * element with the value `0` for later use.
 *
 * To move an element, I follow these steps:
 *
 * - Delete the element. This shifts its pointer to the next element.
 * - Rotate the pointer by the deleted element's value.
 * - Re-insert the element just before the pointer's position. The pointer moves to that location.
 *
 * After running this procedure for every element the specified number of times, I then take the
 * pointer noted previously to point at `0` and call `rotate(1000, zeroPointer)` three times,
 * noting the value where the pointer is located each time. Adding those three values together
 * produces the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const values = split(input, { parseInt: true });
  return [
    mix(values, 1, 1),
    mix(values, DECRYPTION_KEY, 10),
  ];
};

/**
 * Performs the mixing operation and returns the resulting answer.
 *
 * @param {Array<number>} values - the input values
 * @param {number} decryptionKey - the decryption key
 * @param {number} times - the number of times to perform the mix
 * @returns {number} - the answer
 */
const mix = (values, decryptionKey, times) => {
  if (decryptionKey !== 1) {
    // Apply the decryption key
    values = values.map(value => value * decryptionKey);
  }

  // Build the list and create the pointers
  const list = new CircularLinkedList(values);
  let zeroPointer = null;

  for (let i = 1; i < list.size; i++) {
    list.createPointer(i - 1);
    list.rotate(1, i);

    if (zeroPointer === null && list.peek(i) === 0) {
      zeroPointer = i;
    }
  }

  // Perform the mixes
  for (let i = 0; i < times; i++) {
    for (let j = 0; j < list.size; j++) {
      const value = list.remove(j);
      list.rotate(value, j);
      list.insertBefore(value, j);
    }
  }

  // Get the grove coordinates
  let found = [];

  for (let i = 0; i < 3; i++) {
    list.rotate(1000, zeroPointer);
    found.push(list.peek(zeroPointer));
  }

  return add(found);
};
