const solver = require('./day-17');

const EXAMPLE = '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>';

test('Day 17', () => {
  expect(solver(EXAMPLE)).toEqual([ 3068, 1_514_285_714_288 ]);
});
