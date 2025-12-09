const solver = require('./day-09');

// Code for single example
const EXAMPLE = `7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`;

test('Day 9', () => {
  expect(solver(EXAMPLE)).toEqual([ 50, 24 ]);
});
