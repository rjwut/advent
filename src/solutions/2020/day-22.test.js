const solver = require('./day-22');

const EXAMPLE = `Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10`;

test('Day 22', () => {
  expect(solver(EXAMPLE)).toEqual([ 306, 291 ]);
});
