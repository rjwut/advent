const UNSAFE = new Set([
  'escape pod',
  'giant electromagnet',
  'infinite loop',
  'molten lava',
  'photons', 
]);
const NUMBER_OF_SAFE_ITEMS = 8;

/**
 * Tracks the droid's inventory, rules on what items are safe, and determines
 * what `take` and `drop` commands are needed when trying to get past security.
 *
 * @returns {Object} - the inventory API
 */
module.exports = () => {
  const known = [];
  const held = new Set();
  const api = {
    /**
     * Determines whether the given item is safe to pick up.
     *
     * @param {string} item - the item to check
     * @returns {boolean} - `true` if it's safe; `false` otherwise
     */
    isSafe: item => !UNSAFE.has(item),

    /**
     * Adds the given item to the inventory.
     *
     * @param {string} item - the item to add
     * @throws {Error} - if the item is unsafe or is already held
     */
    take: item => {
      if (!api.isSafe(item)) {
        throw new Error(`Not safe to take ${item}`);
      }

      if (!known.includes(item)) {
        known.push(item);
      }

      if (held.has(item)) {
        throw new Error(`Already holding ${item}`);
      }

      held.add(item);
    },

    /**
     * Drops the given item from the inventory.
     *
     * @param {string} item - the item to drop
     * @throws {Error} - if the item is not held
     */
    drop: item => {
      if (!held.has(item)) {
        throw new Error(`Not holding ${item}`);
      }

      held.delete(item);
    },

    /**
     * Says whether all the safe items have been found.
     *
     * @returns {boolean} - `true` if all the safe items have been found;
     * `false` otherwise
     */
    foundAllSafeItems: () => {
      return known.length === NUMBER_OF_SAFE_ITEMS;
    },

    /**
     * Returns the `take` and `drop` commands needed to have the correct items
     * for the attempt to get past security represented by the given value `n`,
     * which is a number between `0` and `255`. Each bit in the binary value of
     * `n` corresponds to an item: `1` means it should be held, `0` means it
     * should not.
     *
     * @param {number} n - the permutation number
     * @returns {Array} - the commands needed to have the correct items for
     * this permutation
     */
    permutation: n => {
      if (n < 0 || n > 255) {
        throw new Error(`Permutation out of range: ${n}`);
      }

      if (known.length < NUMBER_OF_SAFE_ITEMS) {
        throw new Error('Haven\'t found all safe items yet');
      }

      const shouldHold = n.toString(2)
        .padStart(NUMBER_OF_SAFE_ITEMS, '0')
        .split('')
        .map(x => x === '1');
      const commands = [];
      shouldHold.forEach((shouldHoldItem, i) => {
        const item = known[i];

        if (shouldHoldItem && !held.has(item)) {
          commands.push(`take ${item}`);
        } else if (!shouldHoldItem && held.has(item)) {
          commands.push(`drop ${item}`);
        }
      });
      return commands;
    },

    /**
     * Returns the contents of the inventory as an array.
     *
     * @returns {Array} - the contents of the inventory
     */
    toArray: () => [ ...held ],
  };
  return api;
};
