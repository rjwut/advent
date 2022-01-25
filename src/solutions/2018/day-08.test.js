const solver = require('./day-08');

const EXAMPLE = `2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2`;

test('Day 8', () => {
  expect(solver(EXAMPLE)).toEqual([ 138, 66 ]);
});
