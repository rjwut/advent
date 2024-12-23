/**
 * Represents a keypad, and is responsible for determining all combinations of moves to try when
 * moving from one key to another. Internally, this is stored as a `Map` where the keys are
 * two-character strings: the starting and ending keys concatenated together. The resulting value is
 * an array of strings representing the allowed moves to get from the starting key to the ending
 * key. For example, the allowed moves from the `7` to the `6` on the numeric keypad are:
 * `[ 'v>>A`, `>>vA` ]`. Note that all allowed paths between keys have at most one turn, as any more
 * would be less efficient. Paths which would cause the robot's finger to be over the gap at any
 * time are not allowed.
 */
class Keypad {
  #moves;

  /**
   * Constructs the keypad from a string representation of its layout. The numeric keypad layout is:
   *
   * ```txt
   * 789
   * 456
   * 123
   *  0A
   * ```
   *
   * The directional keypad layout is:
   *
   * ```txt
   *  ^A
   * <v>
   * ```
   *
   * Layouts are assumed to have exactly one `A` key and exactly one gap, the latter represented by
   * the space character.
   *
   * @param {string} layout - the key layout for this `Keypad`
   */
  constructor(layout) {
    // Create a `Map` that lets us look up the row and column of each key
    const keys = new Map();
    let rGap, cGap;
    layout.split('\n').forEach((row, r) => {
      [ ...row ].forEach((key, c) => {
        if (key === ' ') {
          rGap = r;
          cGap = c;
        } else {
          keys.set(key, { r, c });
        }
      });
    });

    // Build the moves lookup `Map`
    this.#moves = new Map();
    keys.forEach(({ r: r0, c: c0 }, key0) => {
      keys.forEach(({ r: r1, c: c1 }, key1) => {
        const dr = r1 - r0;
        const dc = c1 - c0;
        const possibleMoves = [];

        if (dr === 0 && dc === 0) {
          // We're already on the key, so just press `A`
          possibleMoves.push('A');
        } else {
          // Determine the keypresses for the vertical and horizontal legs of the move
          const vertLeg = buildMoveLeg(r0, r1, '^', 'v');
          const horzLeg = buildMoveLeg(c0, c1, '<', '>');

          // We can move vertically first if our starting position is not in the same column as the
          // gap OR our ending row is not the same as the gap.
          if (r1 !== rGap || c0 !== cGap) {
            possibleMoves.push(vertLeg + horzLeg + 'A');
          }

          // We can move horizontally first if our starting position is not in the same row as the
          // gap OR our ending column is not the same as the gap.
          if (c1 !== cGap || r0 !== rGap) {
            possibleMoves.push(horzLeg + vertLeg + 'A');
          }

          // If the move is a straight line, we may have two identical moves, so remove one.
          if (possibleMoves.length === 2 && possibleMoves[0] === possibleMoves[1]) {
            possibleMoves.pop();
          }
        }

        // Add these moves to our lookup `Map`
        this.#moves.set(key0 + key1, possibleMoves);
      });
    });
  }

  /**
   * Retrieves the allowed moves from `fromKey` to `toKey`.
   *
   * @param {string} fromKey - the key we're on now
   * @param {string} toKey - the key to which we want to move
   * @returns {string[]} - the allowed moves
   */
  getMoves(fromKey, toKey) {
    return this.#moves.get(fromKey + toKey);
  }
}

/**
 * Builds a single leg (vertical or horizontal) of a move.
 *
 * @param {number} i0 - the starting index
 * @param {number} i1 - the ending index
 * @param {string} negChar - the character for moving in the negative direction
 * @param {string} posChar - the character for moving in the positive direction
 * @returns {string} - the move string
 */
const buildMoveLeg = (i0, i1, negChar, posChar) => {
  const diff = i1 - i0;

  if (diff === 0) {
    return '';
  }

  return (diff < 0 ? negChar : posChar).repeat(Math.abs(diff));
};

module.exports = Keypad;
