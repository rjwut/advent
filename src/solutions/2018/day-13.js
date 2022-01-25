const { parseGrid } = require('../util');

// The four possible directions of travel
const Direction = {
  UP:    { index: 0, key: '^', x:  0, y: -1, track: '|' },
  RIGHT: { index: 1, key: '>', x:  1, y:  0, track: '-' },
  DOWN:  { index: 2, key: 'v', x:  0, y:  1, track: '|' },
  LEFT:  { index: 3, key: '<', x: -1, y:  0, track: '-' },
};

// Directions in clockwise order
const Directions = Object.values(Direction);

// Cart symbols to directions
const CartToDirection = {
  '^': Direction.UP,
  '>': Direction.RIGHT,
  'v': Direction.DOWN,
  '<': Direction.LEFT,
};

// Track bend lookup for new direction
const Bend = {
  '/': {
    '^': Direction.RIGHT,
    '>': Direction.UP,
    'v': Direction.LEFT,
    '<': Direction.DOWN,
   },
   '\\': {
    '^': Direction.LEFT,
    '>': Direction.DOWN,
    'v': Direction.RIGHT,
    '<': Direction.UP,
   },
};

// The order of turns made at intersections is counter-clockwise (left),
// straight, clockwise (right).
const TurnOrder = [ -1, 0, 1 ];

/**
 * Sorts cart by their position.
 *
 * @param {Object} a - the first cart
 * @param {Object} b - the second card
 * @returns {number} - the sort order
 */
const POSITION_SORT = (a, b) => a.y === b.y ? a.x - b.x : a.y - b.y;

/**
 * # [Advent of Code 2018 Day 13](https://adventofcode.com/2018/day/13)
 *
 * This puzzle is pretty straightforward. There are a few things to pay
 * attention to:
 *
 * - The carts must be sorted by position before you start each tick.
 * - Each cart remembers the direction it turned the last time it reached an
 *   intersection; it's not shared memory between carts.
 * - When encountering a `/` bend, carts moving vertically turn clockwise, and
 *   carts moving horizontally turn counter-clockwise. The opposite is true for
 *   `\` bends.
 * - Don't continue to move carts which have crashed.
 *
 * The first step was to parse the input into a grid and find the carts. Each
 * cart was converted into an object:
 *
 * - `x` (number): The cart's X coordinate
 * - `y` (number): The cart's Y coordinate
 * - `dir` (Object): The cart's direction
 * - `turn` (number): How many intersections the cart has encountered so far
 * - `track` (string): The character representing the section of track the cart
 *   is currently on
 * - `crashed` (boolean): Whether the cart has crashed
 *
 * While I could remove the carts from the track map and detect crashes solely
 * by noting when two carts' coordinates are the same, I decided to continually
 * update the track map with their positions. This made printing out the
 * current state for debugging easier, since I could just print the track map
 * without having to add the carts back in first. It did mean that each cart
 * had to store what the track looked like at its current position (the `track`
 * property), so that when it moved the track under it could be restored, but
 * that was pretty easy.
 *
 * With the input parsed, I could now simulate the cart movement. The `tick()`
 * function operates as follows:
 *
 * 1. Sort the carts in the cart array by their position.
 * 2. Create an array of crashes.
 * 3. Iterate the cart array:
 *    1. If this cart has crashed, skip it.
 *    2. Remove the cart from the track map (by replacing it with the track
 *       that's underneath it.)
 *    3. Advance the cart's position one square in its current direction of
 *       travel.
 *    4. Examine the character at the cart's current position (storing it on
 *       the cart object for later replacement):
 *       - If it's `^`, `v`, `<`, or `>`: The cart has collided with another
 *         cart!
 *         1. Find the other cart with the same coordinates.
 *         2. Remove the other cart from the track map.
 *         3. Mark both carts as crashed.
 *         4. Push the crash coordinates to the crashes array.
 *         5. Loop to the next cart.
 *       - If it's `+`: The cart has encountered an intersection:
 *         1. Divide the number of intersections encountered by this cart by
 *            `3` and take the remainder:
 *            - `0`: Turn left.
 *            - `1`: Go straight.
 *            - `2`: Turn right.
 *       - If it's `/` or `\`: The cart has encountered a bend:
 *         - If it's `/` and the cart is travelling vertically, or `\` and it's
 *           travelling horizontally, turn the cart clockwise.
 *         - Otherwise, turn the cart counter-clockwise.
 *       - If it's `-` or `|`: No action.
 *    5. Render the cart's new position on the track map.
 * 4. Removed all crashed carts from the cart array.
 * 5. Return the crashes array.
 *
 * Part one just wants to know where the first crash happens, so we just call
 * `step()` until it returns a non-empty array. The first entry in that array
 * is the location of the crash.
 * 
 * For part two, we immediately remove the crashed carts and continue the
 * simulation, so a cart can't run into the wreckage of a previous crash. This
 * means that every crash always involves exactly two carts. Since the input
 * has been carefully designed to maximize crashes, there will be no surviving
 * carts if the number of carts at the start is even, and one surviving cart
 * left if it's odd. The example tracks in part one have even numbers of carts,
 * while the example track in part two and the real input have odd numbers of
 * carts.
 *
 * To ensure that my simulation works for all scenarios, I made it so that it
 * continues running while there are at least two surviving carts. When the
 * simulation stops, the position of the lone surviving cart is the answer to
 * part two. For the benefit of my test code, part two will return `undefined`
 * if there are no surviving carts.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const simulation = parse(input);
  let firstCrashPos;

  do {
    const crashes = simulation.tick();

    if (!firstCrashPos && crashes.length) {
      const crash = crashes[0];
      firstCrashPos = `${crash.x},${crash.y}`;
    }
  } while (simulation.getLiveCarts().length > 1);

  const lastCart = simulation.getLiveCarts()[0];
  const lastCartPos = lastCart ? `${lastCart.x},${lastCart.y}` : undefined;
  return [ firstCrashPos, lastCartPos ];
};

/**
 * Parses the input and wraps it in a simulation API.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the simulation API
 */
const parse = input => {
  const trackMap = parseGrid(input);
  let carts = [];

  for (let y = 0; y < trackMap.length; y++) {
    const row = trackMap[y];

    for (let x = 0; x < row.length; x++) {
      const chr = row[x];
      const dir = CartToDirection[chr];

      if (dir) { // We found a cart!
        carts.push({ x, y, dir, turn: 0, track: dir.track, crashed: false });
      }
    }
  }

  /**
   * Executes a single tick of the simulation.
   *
   * @returns {Array} - the locations of any crashes
   */
  const tick = () => {
    carts.sort(POSITION_SORT);
    const crashes = [];

    for (let cart of carts) {
      if (cart.crashed) {
        continue; // Don't keep moving crashed carts
      }

      trackMap[cart.y][cart.x] = cart.track;
      cart.x += cart.dir.x;
      cart.y += cart.dir.y;
      cart.track = trackMap[cart.y][cart.x];

      if (CartToDirection[cart.track]) { // **CRASH!**
        const other = carts.find(other => {
          return cart !== other && cart.x === other.x && cart.y === other.y;
        });
        trackMap[cart.y][cart.x] = other.track;
        cart.crashed = true;
        other.crashed = true;
        crashes.push({ x: cart.x, y: cart.y });
        continue;
      }

      if (cart.track === '+') {
        // We've encountered an intersection; decide which way to go.
        const indexDiff = TurnOrder[cart.turn++ % TurnOrder.length];
        const newIndex = (cart.dir.index + indexDiff + Directions.length) % Directions.length;
        cart.dir = Directions[newIndex];
      } else {
        const bend = Bend[cart.track];

        if (bend) {
          // We've encountered a bend in the track; turn accordingly.
          cart.dir = bend[cart.dir.key];
        }
      }

      trackMap[cart.y][cart.x] = cart.dir.key;
    }

    carts = carts.filter(cart => !cart.crashed);
    return crashes;
  };

  /**
   * Returns any surviving carts.
   *
   * @returns {Array} - the surviving carts
   */
  const getLiveCarts = () => carts;

  /**
   * Returns a string representation of the track with the current cart
   * positions.
   *
   * @returns {string} - the track map
   */
  const toString = () => trackMap.map(row => row.join('')).join('\n');

  return {
    tick,
    getLiveCarts,
    toString,
  };
};
