const { split } = require('../util');

/**
 * Describes how the commands work for each part of the puzzle.
 */
const COMMANDS = [
  {
    forward: (distance, state) => {
      state.x += distance;
    },
    up: (distance, state) => {
      state.d -= distance;
    },
    down: (distance, state) => {
      state.d += distance;
    },
  },
  {
    forward: (distance, state) => {
      state.x += distance;
      state.d += state.a * distance;
    },
    up: (distance, state) => {
      state.a -= distance;
    },
    down: (distance, state) => {
      state.a += distance;
    },
  },
];

/**
 * # [Advent of Code 2021 Day 2](https://adventofcode.com/2021/day/2)
 *
 * As usual, I isolate the logic that is different for each part of the puzzle,
 * so that the rest of the code can be reused for both parts. In this case, the
 * part that is different is the interpretation of the commands. This is
 * represented by an object with a property for each of the three commands. The
 * value of each property is a function that accepts the distance value of the
 * action and the current submarine state, and which updates the state
 * accordingly. Then all I have to do is iterate the actions in the course,
 * select the action according to the command set for the given part, and run
 * that command. After the course has been executed, I simply return the
 * product of the distance and the depth.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const course = parse(input);
  return COMMANDS.map(commands => run(commands, course));
};

/**
 * Parses the input into a course, which is an array of actions. Each action is
 * an object with two properties: `command` (one of `'forward'`, `'up'`, or
 * `'down'`) and `distance` (a number).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed input
 */
const parse = input => split(input).map(line => {
  const parts = line.split(' ');
  return {
    command: parts[0],
    distance: parseInt(parts[1], 10),
  };
});

/**
 * Executes the given course using the indicated command set.
 *
 * @param {Object} commands - the command set to use
 * @param {Array} course - the course to execute
 * @returns {number} - the product of the distance and the depth
 */
const run = (commands, course) => {
  const position = course.reduce((state, action) => {
    commands[action.command](action.distance, state);
    return state;
  }, { x: 0, d: 0, a: 0 });
  return position.x * position.d;
};
