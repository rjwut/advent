const solver = require('./day-12');

const EXAMPLE = `0 <-> 2
1 <-> 1
2 <-> 0, 3, 4
3 <-> 2, 4
4 <-> 2, 3, 6
5 <-> 6
6 <-> 4, 5`;

test('Day 12', () => {
  expect(solver(EXAMPLE)).toEqual([ 6, 2 ]);
});
