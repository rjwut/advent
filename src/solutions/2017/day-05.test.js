const solver = require('./day-05');

const EXAMPLE = `0
3
0
1
-3`;

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 5, 10 ]);
});
