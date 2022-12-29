const solver = require('./day-20');

const EXAMPLE = `1
2
-3
3
-2
0
4`;

test('Day 20', () => {
  expect(solver(EXAMPLE)).toEqual([ 3, 1623178306 ]);
});
