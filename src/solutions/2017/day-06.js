/**
 * # [Advent of Code 2017 Day 6](https://adventofcode.com/2017/day/6)
 *
 * For both parts of the problem, we have to detect when the cycles start to
 * loop. I accomplished this by concatenating the banks into a comma-delimited
 * string each cycle, then using those strings as `Map` keys, under which I
 * store the cycle index where the state represented by that string occurred.
 * With each cycle, I check to see if that `Map` key already exists; if it
 * does, we've found the end of the loop. The index of the cycle where that
 * occurs is the answer to part one. The answer to part two is that index minus
 * the one stored under the `Map` key.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const banks = input.trim().split('\t').map(Number);
  const seen = new Map();
  let cycles = 0;
  let key = banks.join();

  do {
    seen.set(key, cycles);
    const blocks = Math.max(...banks);
    let index = banks.indexOf(blocks);
    banks[index] = 0;

    for (let i = 0; i < blocks; i++) {
      index = (index + 1) % banks.length;
      banks[index]++;
    }

    key = banks.join();
    cycles++;
  } while (!seen.has(key));

  return [ cycles, cycles - seen.get(key) ];
};
