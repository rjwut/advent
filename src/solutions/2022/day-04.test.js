const solver = require('./day-04');

// Code for single example
const EXAMPLE = `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`;

test('Day 4', () => {
  expect(solver(EXAMPLE)).toEqual([ 2, 4 ]);
});
