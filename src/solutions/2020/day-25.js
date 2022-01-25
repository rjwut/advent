const { split } = require('../util');

const DIVISOR = 20201227;

/**
 * # [Advent of Code 2020 Day 25](https://adventofcode.com/2020/day/25)
 *
 * First we must determine the lock's loop size. (While we _could_ determine
 * the card's loop size, too, it is not neccessary to do so.) We can do that
 * by simply stepping through the process of computing `transform(7)` and
 * checking after each loop to see if the result equals the known public key.
 * Once it does, the number of loops we executed is the loop size.
 * 
 * Now that we know the loop size, we just pass the card's public key into the
 * lock's `transform()` function to get the encryption key.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answer
 */
module.exports = input => {
  const publicKeys = split(input, { parseInt: true });
  const loopSize = determineLoopSize(publicKeys[0]);
  const encryptionKey = transform(publicKeys[1], loopSize);
  return [ encryptionKey, undefined ];
};

/**
 * Detects the loop size for the device with the given public key.
 *
 * @param {number} publicKey - the device's public key
 * @returns {number} - the loop size
 */
const determineLoopSize = publicKey => {
  let loopSize = 0;
  let value = 1;

  while (value !== publicKey) {
    value = (value * 7) % DIVISOR;
    loopSize++;
  }

  return loopSize;
};

/**
 * Performs the transform operation with the given subject number and loop
 * size.
 *
 * @param {number} subjectNumber - the subject number
 * @param {number} loopSize - the loop size
 * @returns {number} - the transformation result
 */
const transform = (subjectNumber, loopSize) => {
  let value = 1;

  for (let i = 0; i < loopSize; i++) {
    value = (value * subjectNumber) % DIVISOR;
  }

  return value;
};
