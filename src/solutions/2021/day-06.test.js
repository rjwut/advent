const solver = require('./day-06');

const EXAMPLE = `3,4,3,1,2`;

test('Day 6', () => {
  expect(solver(EXAMPLE)).toEqual([ 5934, 26984457539 ]);
});
