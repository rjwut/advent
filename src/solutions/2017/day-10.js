const CircularLinkedList = require('../circular-linked-list');
const { split } = require('../util');

const DEFAULT_SIZE = 256;

/**
 * # [Advent of Code 2017 Day 10](https://adventofcode.com/2017/day/10)
 *
 * The commonality between the two parts of the puzzle is the processing of the
 * circular list using an array of lengths and outputting the resulting array.
 * I used my `CircularLinkedList` class for the processing, adding a new
 * `splice()` method to make it easy to remove and add sequences of elements.
 *
 * One tricky part was the fact that the circular list in the puzzle text has
 * the concept of a "starting" element. This notion is absent in my
 * implementation, but it wasn't really neccessary because I could simply
 * create a pointer to keep track of where the starting element is. However,
 * sometimes the starting element is included in the section that gets
 * `spliced()`, which causes its pointer to get moved backward to the start of
 * the inserted sequence. Fortunately, since every element is unique, I can
 * determine how far the start pointer gets moved by noting the index of its
 * element in the sequence that gets spliced out. Then, after the splice, I
 * just move that pointer forward that many steps to put it back where it was.
 *
 * With that settled, I created a `run()` function which performs the actual
 * processing of the circle. It takes an array of lengths and the number of
 * rounds to perform. (It also takes the circle size as an optional argument,
 * in order to run the example from part one.) This method creates a new
 * `CircularLinkedList` and populates it with the numbers from `0` to `size`.
 * The main list pointer will track our current position in the list, and we
 * create a second pointer to represent the location of the starting element.
 * Then it creates the `skip` counter, setting it to `0`. It then runs the
 * specified number of rounds, each round processing the values from the
 * `lengths` array. For each `lengths` value, it performs the following steps:
 *
 * 1. Capture the sequence of `length` values from the current position of the
 *    main pointer.
 * 2. Store the index of the starting element in the sequence in `index`.
 * 3. Reverse the sequence.
 * 4. Splice the reversed sequence into the circle.
 * 5. If `index` is greater than `0`, move the start pointer `index` steps
 *    forward to put it back into its original position.
 * 6. Move the main pointer `length + skip` steps forward.
 * 7. Increment `skip`.
 *
 * Computing the hash is not too hard. We just iterate the resulting list of
 * values, and if `index % 16 === 0`, we push the current value into the hash
 * array; otherwise, we replace the last value in the hash array with that
 * value XORed with the current value. After all values are iterated, we use
 * `Number.toString(16).padStart(2, '0')` to convert each value to a
 * two-character hexidecimal string, and concatenate them to get the answer.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part of the puzzle to solve
 * @param {number} [size=256] - the size of the circle
 * @returns {Array} - the puzzle answer(s)
 */
module.exports = (input, part, size = DEFAULT_SIZE) => {
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](input, size);
  }

  return parts.map(fn => fn(input, size));
};

/**
 * Computes the answer to part one of the puzzle.
 *
 * @param {string} input - the puzzle input
 * @param {number} size - the size of the circle
 * @returns {number} - the puzzle answer
 */
const part1 = (input, size) => {
  const lengths = split(input, { delimiter: ',', parseInt: true });
  const results = run(lengths, 1, size);
  const [ a, b ] = results;
  return a * b;
};

/**
 * Computes the answer to part two of the puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the puzzle answer
 */
const part2 = input => {
  input = [ ...input.trim() ].map(c => c.charCodeAt(0));
  const lengths = [
    ...input,
    ...[ 17, 31, 73, 47, 23 ],
  ];
  const results = run(lengths, 64);
  return computeHash(results);
};

/**
 * Processes the circle using the specified lengths and number of rounds.
 *
 * @param {Array} lengths - the lengths to process
 * @param {number} rounds - the number of rounds to perform
 * @param {number} size - the size of the circle
 * @returns {Array} - the resulting list
 */
const run = (lengths, rounds, size) => {
  const numbers = new Array(size);

  for (let i = 0; i < size; i++) {
    numbers[i] = i;
  }

  const circle = new CircularLinkedList(numbers);
  const start = circle.createPointer();
  let skip = 0;

  for (let i = 0; i < rounds; i++) {
    for (const length of lengths) {
      const sequence = circle.sequence(length);
      const index = sequence.indexOf(circle.peek(start));
      circle.splice(length, sequence.reverse());
  
      if (index > 0) {
        circle.rotate(index, start);
      }
  
      circle.rotate(length + skip++);
    }
  }

  return [ ...circle.iterator(start) ];
};

/**
 * Computes the knot hash of the specified list.
 *
 * @param {Array} numbers - the values to hash
 * @returns {string} - the hash
 */
const computeHash = numbers => {
  const denseHash = numbers.reduce((hash, number, i) => {
    if (i % 16 === 0) {
      hash.push(number);
    } else {
      hash[hash.length - 1] ^= number;
    }

    return hash;
  }, []);
  return denseHash.map(hash => hash.toString(16).padStart(2, '0')).join('');
};
