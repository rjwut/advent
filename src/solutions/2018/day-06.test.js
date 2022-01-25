const solver = require('./day-06');

const EXAMPLE = `1, 1
1, 6
8, 3
3, 4
5, 5
8, 9`;

test('Day 6', () => {
  expect(solver(EXAMPLE, 32)).toEqual([ 17, 16 ]);
});
