const solver = require('./day-06');

const EXAMPLE = '0\t2\t7\t0';

test('Day 6', () => {
  expect(solver(EXAMPLE)).toEqual([ 5, 4 ]);
});
