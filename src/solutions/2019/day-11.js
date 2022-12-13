const IntcodeVm = require('./intcode');
const InfiniteGrid = require('../infinite-grid');
const ocr = require('../ocr');

const DIRECTIONS = [
  [ -1,  0 ],
  [  0,  1 ],
  [  1,  0 ],
  [  0, -1 ],
];

/**
 * I created a `paint()` function that paints the robot's path, using my
 * `BooleanInfiniteGrid` class to keep track of which panels have been painted.
 * It accepts two arguments: the Intcode program and the color of the starting
 * panel. After executing, the function returns the `BooleanInfiniteGrid` that
 * describes what has been painted.
 *
 * For part one, we just report how many entries are in the
 * `BooleanInfiniteGrid`. For part two, we have to render the grid to a string,
 * then feed those glyphs into my `ocr` module to get the solution.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async input => {
  return [ part1(input), await part2(input) ];
};

/**
 * Solves part one of the puzzle by assuming the starting panel is black and
 * reporting how many panels have been painted white.
 *
 * @param {string} program - the puzzle input (the Intcode program)
 * @returns {number} - the number of panels painted white
 */
const part1 = program => {
  const panels = paint(program, 0);
  return panels.size;
};

/**
 * Solves part two ofthe puzzle by assuming the starting panel is white and
 * reporting the registration identifier painted by the robot.
 *
 * @param {string} program - the puzzle input (the Intcode program)
 * @returns {string} - the registration identifier
 */
const part2 = async program => {
  const panels = paint(program, 1);
  const glyphs = panels.toString({ translate: panel => panel ? '#' : '.' });
  return ocr(glyphs);
};

/**
 * Executes the painting program, then returns a `BooleanInfiniteGrid` that
 * contains the coordinates of all the panels that were painted white.
 *
 * @param {string} program - the puzzle input (the Intcode program)
 * @param {number} startPanelColor - `0` for black, `1` for white
 * @returns {BooleanInfiniteGrid} - the grid of painted panels
 */
const paint = (program, startPanelColor) => {
  const panels = new InfiniteGrid();

  if (startPanelColor === 1) {
    panels.put([ 0, 0 ], true);
  }

  let coords = [ 0, 0 ];
  let dirIndex = 0;
  const robot = new IntcodeVm();
  robot.load(program);
  const getColor = () => panels.get(coords) ? 1 : 0;
  const setColor = color => panels.put(coords, color === 1);

  do {
    robot.enqueueInput(getColor());
    robot.run();
    const output = robot.dequeueAllOutput();
    setColor(output[0]);
    const turn = output[1];
    dirIndex += turn === 0 ? -1 : 1;

    if (dirIndex === -1) {
      dirIndex = 3;
    }

    if (dirIndex === 4) {
      dirIndex = 0;
    }

    coords = coords.map((coord, i) => coord + DIRECTIONS[dirIndex][i]);
  } while (robot.state !== 'terminated');

  return panels;
};
