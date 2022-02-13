const { split } = require('../util');

const KEYPADS = [
  '      123  456  789      ',
  '          1     234   56789   ABC     D          ',
];
const DIRECTIONS = {
  U: keypad => keypad.index - keypad.size,
  D: keypad => keypad.index + keypad.size,
  L: keypad => keypad.index - 1,
  R: keypad => keypad.index + 1,
};

/**
 * # [Advent of Code 2016 Day 2](https://adventofcode.com/2016/day/2)
 *
 * I originally solved part one by simply tracking the current button's digit,
 * and adding or subtracting three to move vertically and one to move
 * horizontally. Part two changed the layout and added letters to the buttons.
 * I decided I still wanted to solve both parts with a single pass over the
 * instructions, and I wanted my solution to work for any arbitrary keypad
 * layout within a square grid.
 *
 * The grid is represented as a string of characters naming the cells in row-
 * major order. All non-space characters are considered buttons, and there is a
 * one-cell wide margin of spaces on the borders of the grid. Each keypad is an
 * object containing the grid string, the size of the grid, the index of the
 * current button, and the code as entered so far. For each direction given, I
 * check to see if moving that direction results in moving off the keypad (new
 * cell is a space), and if so, I stay on the current button. At the end of a
 * line, I grab the current button on each grid and add it to the corresponding
 * code string.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const instructions = split(input).map(line => [ ...line ]);
  const keypads = KEYPADS.map(grid => ({
    grid,
    size: Math.sqrt(grid.length),
    index: grid.indexOf('5'),
    code: '',
  }));
  instructions.forEach(line => {
    line.forEach(direction => {
      const directionFn = DIRECTIONS[direction];
      keypads.forEach(keypad => {
        const newIndex = directionFn(keypad);
        const newBtn = keypad.grid[newIndex];

        if (newBtn !== ' ') {
          keypad.index = newIndex;
        }
      });
    });
    keypads.forEach(keypad => keypad.code += keypad.grid[keypad.index]);
  });
  return keypads.map(keypad => keypad.code);
};
