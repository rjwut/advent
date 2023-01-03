const Display = require('./display');

/**
 * # [Advent of Code 2016 Day 8](https://adventofcode.com/2016/day/8)
 *
 * I parsed the input with a regular expression and converted it to an array of
 * instruction objects. The existing `SimpleGrid` class provides the
 * implementation of the screen, with some new methods:
 *
 * - `fill()`: Fill a rectangular region of the grid with a character.
 * - `count()`: Count the number of occurrences of a value in the grid.
 * - `shiftRow()` and `shiftColumn()`: Performs the "rotation" operation ad
 *   described in the puzzle.
 *
 * Then it's simply a matter of invoking the corresponding `SimpleGrid` method
 * for each operation, counting up the lit pixels for part one, and feeding the
 * string render of the grid to my `ocr` module for part two.
 *
 * All of this code was refactored out into a separate `Display` class because
 * it gets reused in the bonus challenge.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = async input => {
  const display = new Display(6, 50);
  display.execute(input);
  return [
    display.litPixels,
    await display.ocr(),
  ];
};

module.exports = solver;
