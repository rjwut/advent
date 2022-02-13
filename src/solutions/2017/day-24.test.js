const solver = require('./day-24');

const EXAMPLE = `0/2
2/2
2/3
3/4
3/5
0/1
10/1
9/10`;

test('Day 24', () => {
  expect(solver(EXAMPLE)).toEqual([ 31, 19 ]);
});
