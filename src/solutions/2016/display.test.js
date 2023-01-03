const Display = require('./display');

const EXAMPLE_INPUT = `rect 3x2
rotate column x=1 by 1
rotate row y=0 by 4
rotate column x=1 by 1`;
const EXAMPLE_OUTPUT = `.#..#.#
#.#....
.#.....`;

test('Display', () => {
  const display = new Display(3, 7);
  display.execute(EXAMPLE_INPUT);
  expect(display.toString()).toEqual(EXAMPLE_OUTPUT);
});
