const CircularLinkedList = require('../circular-linked-list');

const DEFAULT_ROUNDS = 64;
const DEFAULT_SIZE = 256;

/**
 * Computes the sparse hash using the given lengths array, using the specified
 * number of rounds and circle size.
 *
 * @param {Array} lengths - the lengths to process
 * @param {number} [rounds=256] - the number of rounds to perform
 * @param {number} [size=256] - the size of the circle 
 * @returns {Array} - the resulting sparse hash
 */
const computeSparseHash = (lengths, rounds = DEFAULT_ROUNDS, size = DEFAULT_SIZE) => {
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
 * Returns the knot hash for the given input.
 *
 * @param {Array|string} input - the input to hash
 * @returns {Array} - the resulting list
 */
const computeKnotHash = input => {
  if (typeof input === 'string') {
    input = [ ...input.trim() ].map(c => c.charCodeAt(0));
  }

  input = [ ...input, 17, 31, 73, 47, 23 ];
  const sparseHash = computeSparseHash(input);
  const denseHash = sparseHash.reduce((hash, number, i) => {
    if (i % 16 === 0) {
      hash.push(number);
    } else {
      hash[hash.length - 1] ^= number;
    }

    return hash;
  }, [])
  return denseHash.map(hash => hash.toString(16).padStart(2, '0')).join('');
};

computeKnotHash.computeSparseHash = computeSparseHash;
module.exports = computeKnotHash;
