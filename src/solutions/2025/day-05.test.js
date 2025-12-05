const solver = require('./day-05');

// Code for single example
const EXAMPLE = `3-5
10-14
16-20
12-18

1
5
8
11
17
32`;

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 3, 14 ]);
});
