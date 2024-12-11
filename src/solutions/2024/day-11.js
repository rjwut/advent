const { split } = require('../util');

/**
 * # [Advent of Code 2024 Day 11](https://adventofcode.com/2024/day/11)
 *
 * The number of stones was clearly going to grow very quickly, and it was my guess (which turned
 * out to be correct) that part two would be much worse in that regard. To keep time and memory
 * costs from exploding, instead of storing the stones in a simple array, I used a `Map` to track
 * how many stones I had with any given number on them. To make this easier, I created a class
 * called `Counter` which extends `Map` and added two more methods to it:
 *
 * - `put(key, value)`: If the given key isn't present in the `Map`, it acts the same as `set()`.
 *   Otherwise, it retrieves that value, adds the given value to it, and stores it back in the
 *   `Map`.
 * - `count()`: Returns the sum of all the values in the `Map`.
 *
 * Once I parsed out the initial line of stones, I inserted each one into a `Counter`. Then I
 * created a function called `blink()` that accepted a `Counter` containing the current stones and
 * the number of times to blink. For each blink, I iterated the `Counter` entries, performing the
 * actions described in the puzzle for the stones, but in bulk: if I had 7 stones with `0` on them,
 * they became 7 stones with `1` on them, and so on. The results were stored in a new `Counter`.
 * This process was repeated for the specified number of blinks.
 *
 * After 25 blinks, `count()` produced the answer to part one. For part two, I merely had to blink
 * 50 more times and call `count()` again to get part two's answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const originalStones = parse(input);
  const stones = blink(originalStones, 25);
  const part1 = stones.count();
  const part2 = blink(stones, 50).count();
  return [ part1, part2 ];
};

/**
 * Parse the input.
 *
 * @param {string} input - the puzzle input (the initial configuration of stones)
 * @returns {Counter} - the stones stored in a `Counter`
 */
const parse = input => {
  const stones = split(input.trim(), { delimiter: ' ', parseInt: true });
  return stones.reduce((counter, stone) => {
    counter.put(stone, 1);
    return counter;
  }, new Counter());
}

/**
 * Transforms the set of stones according to the blink rules described in the puzzle.
 *
 * @param {Counter} stones - the stones to transform
 * @param {number} times - the number of times to blink
 * @returns {Counter} - the transformed stones
 */
const blink = (stones, times) => {
  for (let i = 0; i < times; i++) {
    const oldStones = [ ...stones.entries() ];
    stones = new Counter();

    for (const [ stone, count ] of oldStones) {
      if (stone === 0) {
        stones.put(1, count);
      } else {
        const stoneStr = String(stone);

        if (stoneStr.length % 2 === 0) {
          const half = stoneStr.length / 2;
          stones.put(Number(stoneStr.substring(0, half)), count);
          stones.put(Number(stoneStr.substring(half)), count);
        } else {
          stones.put(stone * 2024, count);
        }
      }
    }
  }

  return stones;
};

/**
 * An extension of the `Map` class to facilitate counting the stones.
 */
class Counter extends Map {
  /**
   * Adds the given value to the value stored under the named key. If the key isn't present, a new
   * entry containing the given value is created.
   *
   * @param {number} key - the key to check
   * @param {number} value - the value to add to the entry for the given key
   */
  put(key, value) {
    this.set(key, (this.get(key) ?? 0) + value);
  }

  /**
   * Sums all values in the `Counter`.
   *
  * @returns {number} - the sum of all values
   */
  count() {
    return [ ...this.values() ].reduce(
      (sum, count) => sum + count,
      0
    );
  }
}
