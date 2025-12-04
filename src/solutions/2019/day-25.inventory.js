const UNSAFE = new Set([
  'escape pod',
  'giant electromagnet',
  'infinite loop',
  'molten lava',
  'photons',
]);
const NUMBER_OF_SAFE_ITEMS = 8;

/**
 * Tracks the droid's inventory, rules on what items are safe, and determines what item to `take`
 * and `drop` for each attempt at getting past security.
 *
 * @returns {Object} - the inventory API
 */
class Inventory {
  #known;
  #held;

  constructor() {
    this.#known = [];
    this.#held = new Set();
  }

  /**
   * Determines whether the given item is safe to pick up.
   *
   * @param {string} item - the item to check
   * @returns {boolean} - `true` if it's safe; `false` otherwise
   */
  isSafe(item) {
    return !UNSAFE.has(item);
  }

  /**
   * Adds the given item to the inventory.
   *
   * @param {string} item - the item to add
   * @throws {Error} - if the item is unsafe or is already held
   */
  take(item) {
    if (!this.isSafe(item)) {
      throw new Error(`Not safe to take ${item}`);
    }

    if (!this.#known.includes(item)) {
      this.#known.push(item);
    }

    if (this.#held.has(item)) {
      throw new Error(`Already holding ${item}`);
    }

    this.#held.add(item);
  }

  /**
   * Drops the given item from the inventory.
   *
   * @param {string} item - the item to drop
   * @throws {Error} - if the item is not held
   */
  drop(item) {
    if (!this.#held.has(item)) {
      throw new Error(`Not holding ${item}`);
    }

    this.#held.delete(item);
  }

  /**
   * Says whether all the safe items have been found.
   *
   * @returns {boolean} - `true` if all the safe items have been found; `false` otherwise
   */
  foundAllSafeItems() {
    return this.#known.length === NUMBER_OF_SAFE_ITEMS;
  }

  /**
   * Returns the `take` or `drop` command needed to have the correct items for the attempt to get
   * past security represented by the given value `n`, which is a number between `0` and `255`. This
   * number is treated as an index into a Gray code sequence so that only one item is taken or
   * dropped at a time.
   *
   * @param {number} n - the permutation number
   * @returns {string|null} - the `take` or `drop` command to execute, or `null` if `n` is `0`,
   * since the first attempt will be with all items held, so no `take` or `drop` is needed
   * @throws {Error} - if `n` is out of range or not all safe items have been found
   */
  permutation(n) {
    if (n < 0 || n > 255) {
      throw new Error(`Permutation out of range: ${n}`);
    }

    if (this.#known.length < NUMBER_OF_SAFE_ITEMS) {
      throw new Error('Haven\'t found all safe items yet');
    }

    if (n === 0) {
      return null;
    }

    const i = (n + 170) % 256;
    const beforeGray = grayCode(((i - 1) + 256) % 256);
    const afterGray = grayCode(i);
    const take = afterGray > beforeGray;
    const itemIndex = Math.log2(beforeGray ^ afterGray);
    return `${take ? 'take' : 'drop'} ${this.#known[itemIndex]}`;
  }

  /**
   * Returns the contents of the inventory as an array.
   *
   * @returns {Array} - the contents of the inventory
   */
  toArray() {
    return [ ...this.#held ];
  }
}

/**
 * Generates the nth Gray code number.
 *
 * @param {number} n - a number between 0 and 255
 * @returns {number} - the corresponding Gray code number
 */
const grayCode = n => n ^ (n >> 1);

module.exports = Inventory;
