/**
 * Represents a single robot.
 */
class Robot {
  #keypad;
  #next;
  #key;
  #memo;

  /**
   * @param {Keypad} keypad - the `Keypad` this `Robot` uses
   * @param {Robot} [next] - the next `Robot` in the chain, or `undefined` if this is the last
   * `Robot`
   */
  constructor(keypad, next) {
    this.#keypad = keypad;
    this.#next = next;
    this.#key = 'A';
    this.#memo = new Map();
  }

  /**
   * Computes the cost of moving from this `Robot`'s current key to the named one, then pressing
   * that key. When this method is complete, the `Robot`'s finger will be over the new key. If there
   * is a next `Robot` in the chain, this method will recursively call that `Robot` to determine the
   * total cost.
   *
   * @param {string} key - the key to move to
   * @returns {number} - the cost of moving to the key
   */
  cost(key) {
    const memoKey = this.#key + key;
    let cost = this.#memo.get(memoKey);

    if (cost === undefined) {
      // We haven't memoized this move yet, so compute and store it
      const moves = this.#keypad.getMoves(this.#key, key);
      cost = 0;

      if (this.#next) {
        // There's another Robot in the chain, recurse to it for each key in the moves
        cost += Math.min(
          ...moves.map(move => {
            let pathCost = 0;

            for (const moveKey of move) {
              pathCost += this.#next.cost(moveKey);
            }

            return pathCost;
          })
        );
      } else {
        // This is the last Robot in the chain, so just add the number of moves
        cost = moves[0].length;
      }

      // Store this for later
      this.#memo.set(memoKey, cost);
    }

    this.#key = key;
    return cost;
  }
}

module.exports = Robot;
