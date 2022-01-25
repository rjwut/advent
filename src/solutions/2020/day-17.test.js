const solver = require('./day-17');

const EXAMPLE = `.#.
..#
###`;

test('Day 17', () => {
  expect(solver(EXAMPLE, 2)).toEqual(5);
  expect(solver(EXAMPLE)).toEqual([ 112, 848 ]);
});
