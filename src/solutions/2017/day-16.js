const DEFAULT_SIZE = 16;
const MOVES_REGEXP = /([psx])([0-9]{1,2}|[a-p])(?:\/([0-9]{1,2}|[a-p]))?/gm;
const MOVE_NAMES = { p: 'partner', s: 'spin', x: 'exchange' };
const MOVES = {
  /**
   * Swaps the programs at the given indices.
   *
   * @param {Array} programs - the program array
   * @param {Array} args - two elements: the indexes to swap
   */
  exchange: (programs, [ index0, index1 ]) => {
    const temp = programs[index0];
    programs[index0] = programs[index1];
    programs[index1] = temp;
  },

  /**
   * Swaps the two named programs.
   *
   * @param {Array} programs - the program array
   * @param {Array} args - two elements: the programs to swap
   */
  partner: (programs, [ parter0, partner1 ]) => {
    MOVES.exchange(programs, [ programs.indexOf(parter0), programs.indexOf(partner1) ]);
  },

  /**
   * Takes the given number of programs from the end of the array and moves
   * them to the front of the array.
   *
   * @param {Array} programs - the program array
   * @param {Array} args - one element: the number of programs to spin
   */
  spin: (programs, [ amount ]) => {
    programs.splice(0, 0, ...programs.splice(programs.length - amount, amount));
  },
};

/**
 * # [Advent of Code 2017 Day 16](https://adventofcode.com/2017/day/16)
 *
 * Part one is just making sure that we properly implement the dance moves
 * before we get to part two. I used a `RegExp` to parse the input into an
 * array of move objects. Each move object has a `type` (one of `'exchange'`,
 * `'partner'`, or `'spin'`) and an `args` array, whose contents depends on
 * `type`:
 *
 * - `'exchange'`: two integers
 * - `'partner'`: two characters
 * - `'spin'`: one integer
 *
 * The `MOVES` object contains functions that implement each of these three
 * move types. I then implemented a `dance()` function that would perform all
 * the moves in the order they appear in the input, then return a string
 * representing the order of the programs after the dance. We'll refer to this
 * string as their "state," which will be important for part two. The state
 * after the dance is the answer to part one.
 *
 * Part two wants the state after one billion dances. We can't perform that in
 * a reasonable amount of time, which means there must be some way to compute
 * what the state would be without having to simulate a billion dances. There
 * are a total of 20,922,789,888,000 possible permutations, way more than one
 * billion. This would indicate that all possible permutations aren't
 * reachable, and that there's some point where we arrive at the beginning
 * state, creating a cycle. (For my input, this occurs after 60 dances have
 * been performed; it's possible other inputs may have different cycle
 * lengths.) We need to be able to discover when that cycle occurs, then use
 * that information to compute the state after any arbitrary number of dances.
 *
 * To accomplish this, I refactored `dance()` so that instead of simply
 * returning the state at the end of the dance, it would store the state into
 * a `states` array, which we can use later to look up a previously-seen state.
 *
 * If `dance()` produces a state that matches the starting state, we've
 * discovered the cycle. The current index is then our cycle length. With that
 * information, we can then find the state that occurs at any given index by
 * simply dividing that index by the cycle length, taking the remainder, and
 * looking up the state that occurred at that index in the `states` array.
 *
 * The `buildDanceComputer()` function sets all of this up and returns a
 * function which will perform dances until the index reaches the target index
 * or a cycle is discovered. If the cycle is found, we change `index` to
 * `index % cycleLength`. Then we just return the state at `states[index]`.
 *
 * @param {string} input - the puzzle input
 * @param {number} [size=16] - the size of the program array
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, size = DEFAULT_SIZE) => {
  const moves = parse(input);
  const getStateAt = buildDanceComputer(moves, size);
  return [ 1, 1_000_000_000 ].map(getStateAt);
}

/**
 * Parses the input into an array of move objects. Each move object has the
 * following properties:
 *
 * - `type` (string): One of `'exchange'`, `'partner'`, or `'spin'`
 * - `args` (`Array`): An array of arguments for the move; there may be one or
 *   two elements, and they may be integers or characters, depending on `type`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed moves
 */
const parse = input => [ ...input.matchAll(MOVES_REGEXP) ]
  .map(match => {
    const move = { type: MOVE_NAMES[match[1]] };
    const coerce = move.type === 'partner' ? String : Number;
    move.args = match.slice(2).map(coerce);
    return move;
  });

/**
 * Returns a function that can produce the state after a given number of
 * dances. This function contains the logic for determining when a cycle occurs
 * so that we don't have to brute force it all the way to the target number of
 * dances.
 *
 * @param {Array} moves - the moves to be performed for each dance
 * @param {number} size - the size of the program array
 * @returns {Function} - the function that can produce the state after the
 * desired number of dances
 */
const buildDanceComputer = (moves, size) => {
  // Set up initial programs state
  const programs = new Array(size);

  for (let i = 0; i < size; i++) {
    programs[i] = String.fromCharCode(i + 97);
  }

  const startState = programs.join('');
  // Create lookup Array
  const states = [];
  states[0] = startState;
  let danceCount = 0, cycleLength = 0;

  /**
   * Peforms a single dance. If the resulting state has been encountered
   * previously, `cycleLength` is updated to the current index. This function
   * assumes that the cycle hasn't already been discovered.
   */
  const dance = () => {
    danceCount++;
    moves.forEach(move => {
      MOVES[move.type](programs, move.args);
    });
    const state = programs.join('');

    if (state === startState) {
      cycleLength = danceCount;
    } else {
      states.push(state);
    }
  };

  /**
   * Returns the state after the given number of dances.
   *
   * @param {number} index - the index whose state we want to know
   * @returns {string} - the state at the given index
   */
  return index => {
    while (!cycleLength && danceCount < index) {
      dance();
    }

    if (cycleLength) {
      index %= cycleLength;
    }

    return states[index];
  };
};
