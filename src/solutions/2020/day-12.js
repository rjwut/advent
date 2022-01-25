const { split } = require('../util');

const MOVE = {
  N: (obj, value) => {
    obj.y += value;
  },
  S: (obj, value) => {
    obj.y -= value;
  },
  E: (obj, value) => {
    obj.x += value;
  },
  W: (obj, value) => {
    obj.x -= value;
  },
}

const DIRECTIONS = [ MOVE.N, MOVE.E, MOVE.S, MOVE.W ];

/**
 * # [Advent of Code 2020 Day 12](https://adventofcode.com/2020/day/12)
 *
 * I used an object to represent the current state of the ferry (and in part
 * two, its waypoint), using `x` and `y` properties to store coordinates for
 * each, so that we can use generic functions to move both the ferry and the
 * waypoint. These functions are stored under the `MOVE` object.
 *
 * For part one:
 *
 * - The `N`, `S`, `E`, and `W` instructions move the ship in that direction
 *   without rotating it.
 * - `L` and `R` rotate the ship the given number of degrees (always a multiple
 *   of 90).
 * - `F` moves the ship in its current direction.
 *
 * We store the ship's current direction in a `dir`: `0` for north, `1` for
 * east, `2` for south, and `3` for west. These correspond to the indices of
 * the `DIRECTIONS` array, which stores the corresponding `MOVE` method for
 * each direction. This makes it easy to translate the ship's current direction
 * into a function to move in that direction.
 *
 * That just leaves rotating the ship. First of all, rotating left by `x`
 * degrees is the same as rotating right by `360 - x` degrees. So we can
 * translate between the angle and the number of 90-degree right turns as
 * follows:
 *
 * - Right: `turns = angle / 90`
 * - Left: `turns = 4 - angle / 90`
 *
 * So when we get a turn instruction, we translate it into the number of
 * 90-degree right turns, and set our direction index to its current value plus
 * the number of 90-degree right turns modulo 4.
 *
 * For part two:
 *
 * - The `N`, `S`, `E`, and `W` instructions move a waypoint instead of the
 *   ship itself.
 * - The `L` and `R` instructions rotate the waypoint relative to the ship.
 * - The `F` instruction moves the ship to the current waypoint's location the
 *   given number of times, with the waypoint remaining at the same position
 *   relative to the ship.
 *
 * The movement commands are pretty easy with the existing code. The rotation
 * can be handled by recognizing that each 90-degree turn to the right swaps
 * the `x` and `y` coordinates of the waypoint, then negates the `y`
 * coordinate. (The waypoint coordinates are stored relative to the ship.) So
 * we compute the number of 90-degree right turns in the same way that we
 * handled rotating the ship in part one, then apply the rotation algorithm
 * that many times to compute the new waypoint position.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const instructions = parse(input);
  return [ interpreter1, interpreter2 ].map(interpreter => {
    const state = navigate(instructions, interpreter);
    return Math.abs(state.ship.x) + Math.abs(state.ship.y);
  })
};

/**
 * Parses the input string into an array of instruction objects.
 *
 * @param {string} input - the input string
 * @returns {Array} - the instruction array
 */
 const parse = input => split(input)
 .map(line => ({
   action: line.charAt(0),
   value: parseInt(line.substring(1)),
 }));

/**
 * Starting at 0,0 facing east, follows the given instructions and returns the
 * resulting state.
 *
 * @param {Array} instructions - the instruction array
 * @param {Function} interpreter - the function that interprets the instruction
 *   and returns the resulting state
 * @returns {Object}
 */
const navigate = (instructions, interpreter) => {
  let state = null;
  instructions.forEach(instruction => {
    state = interpreter(state, instruction)
    });
  return state;
};

/**
 * Interprets the given instruction according to part one's rules, and updates
 * the state object accordingly.
 *
 * @param {Object} state - the state of the ferry 
 * @param {Object} instruction - the instruction object
 * @returns {Object} - the state object
 */
const interpreter1 = (state, instruction) => {
  const INSTRUCTIONS = {
    N: (state, value) => MOVE.N(state.ship, value),
    S: (state, value) => MOVE.S(state.ship, value),
    E: (state, value) => MOVE.E(state.ship, value),
    W: (state, value) => MOVE.W(state.ship, value),
    L: (state, value) => {
      state.ship.dir = (state.ship.dir + (4 - value / 90)) % 4;
    },
    R: (state, value) => {
      state.ship.dir = (state.ship.dir + value / 90) % 4;
    },
    F: (state, value) => {
      DIRECTIONS[state.ship.dir](state.ship, value);
    },
  };

  if (state === null) {
    state = {
      ship: { x: 0, y: 0, dir: 1 },
    };
  }

  INSTRUCTIONS[instruction.action](state, instruction.value);
  return state;
}

/**
 * Interprets the given instruction according to part two's rules, and updates
 * the state object accordingly.
 *
 * @param {Object} state - the state of the ferry 
 * @param {Object} instruction - the instruction object
 * @returns {Object} - the state object
 */
 const interpreter2 = (state, instruction) => {
  const INSTRUCTIONS = {
    N: (state, value) => MOVE.N(state.waypoint, value),
    S: (state, value) => MOVE.S(state.waypoint, value),
    E: (state, value) => MOVE.E(state.waypoint, value),
    W: (state, value) => MOVE.W(state.waypoint, value),
    L: (state, value) => rotateWaypoint(state, (4 - value / 90) % 4),
    R: (state, value) => rotateWaypoint(state, (value / 90) % 4), 
    F: (state, value) => {
      for (let i = 0; i < value; i++) {
        state.ship.x += state.waypoint.x;
        state.ship.y += state.waypoint.y;
      }
    },
  };

  if (state === null) {
    state = {
      ship: { x: 0, y: 0 },
      waypoint: { x: 10, y: 1 }
    };
  }

  INSTRUCTIONS[instruction.action](state, instruction.value);
  return state;
}

/**
 * Rotates the waypoint by 90 degrees clockwise the indicated number of times.
 *
 * @param {Object} state - the state object
 * @param {number} turns - how many 90 degree turns to apply
 */
const rotateWaypoint = (state, turns) => {
  for (let i = 0; i < turns; i++) {
    const temp = state.waypoint.x;
    state.waypoint.x = state.waypoint.y;
    state.waypoint.y = -temp;
  }
};
