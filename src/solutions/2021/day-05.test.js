const solver = require('./day-05');

const EXAMPLE = `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`;

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 5, 12 ]);
});
