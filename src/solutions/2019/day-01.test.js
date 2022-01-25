const solver = require('./day-01');

const EXAMPLE = `12
14
1969
100756`;

test('Day 1', () => {
  expect(solver(EXAMPLE)).toEqual([ 34241, 51316 ]);
});
