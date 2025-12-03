const { split } = require('../util');

/**
 * # [Advent of Code 2025 Day 3](https://adventofcode.com/2025/day/3)
 *
 * The difference between the two parts of the puzzle is the number of batteries to turn on in each
 * bank (2 for part 1, 12 for part 2). Finding the largest possible joltage for a given bank can be
 * handled the same way for both parts.
 *
 * After splitting the input into lines and each line into an array of digits, we first create a
 * function that can find the largest individual battery in a given bank within a specified range of
 * indices. We then can find the largest joltage for a given bank by iterating through the bank to
 * find the largest battery for each battery we need to turn on, adjusting the start and end indices
 * accordingly. Since the leftmost battery is the most significant digit in the resulting joltage, a
 * greedy approach of always choosing the largest available battery within the range will yield the
 * correct result.
 *
 * The trick is to make sure to set the range so that you don't run out of batteries before the
 * required number have been turned on. The start index starts at 0 for the first battery, and with
 * each subsequent one is set to the index after that of the battery just found. The end index must
 * start at the length of the bank minus the number of batteries to turn on plus 1, incrementing it
 * after each battery that's found.
 *
 * The chosen batteries are pushed onto an array. After all required batteries have been found, we
 * concatenate the digits of those batteries and convert the result to a number. Summing the
 * joltages for each bank produces the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const banks = split(input).map(line => [ ...line ].map(Number));
  return [ 2, 12 ].map(numBatteriesToTurnOn => {
    return banks.map(bank => findLargestJoltage(bank, numBatteriesToTurnOn))
      .reduce((a, b) => a + b, 0);
  });
};

/**
 * Returns the largest possible joltage that can be produced by turning on the specified number
 * of batteries in the given bank.
 *
 * @param {number[]} bank - the battery bank
 * @param {number} numBatteriesToTurnOn - how many batteries are to be turned on
 * @returns {number} - the largest possible joltage
 */
const findLargestJoltage = (bank, numBatteriesToTurnOn) => {
  const batteries = [];
  let startIndex = 0;
  let endIndex = bank.length - numBatteriesToTurnOn + 1;

  for (let i = 0; i < numBatteriesToTurnOn; i++) {
    const largestIndex = findLargestBattery(bank, startIndex, endIndex);
    batteries.push(bank[largestIndex]);
    startIndex = largestIndex + 1;
    endIndex++;
  }

  return Number(batteries.join(''));
};

/**
 * Finds the largest battery value in the given bank between the specified start and end indices.
 *
 * @param {number[]} bank - the battery bank
 * @param {number} startIndex - the index to start searching from (inclusive)
 * @param {number} endIndex - the index to stop searching at (exclusive)
 * @returns {number} - the index of the largest battery found
 */
const findLargestBattery = (bank, startIndex, endIndex) => {
  let largestIndex = startIndex;

  for (let i = startIndex + 1; i < endIndex; i++) {
    if (bank[i] > bank[largestIndex]) {
      largestIndex = i;
    }
  }

  return largestIndex;
};
