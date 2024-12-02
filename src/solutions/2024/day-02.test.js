const solver = require('./day-02');

// Code for single example
const EXAMPLE = `7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9`;

test('Day 2', () => {
  expect(solver(EXAMPLE)).toEqual([ 2, 4 ]);
});
