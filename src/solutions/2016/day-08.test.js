const solver = require('./day-08');

const EXAMPLE_INPUT = `rect 3x2
rotate column x=1 by 1
rotate row y=0 by 4
rotate column x=1 by 1`;
const EXAMPLE_OUTPUT = `.#..#.#
#.#....
.#.....`;

test('Day 8', () => {
  expect(solver.execute(EXAMPLE_INPUT, 3, 7).toString()).toEqual(EXAMPLE_OUTPUT);
});
