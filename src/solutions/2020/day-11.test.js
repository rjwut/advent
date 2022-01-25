const solver = require('./day-11');

const EXAMPLE = `L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL`;

test('Day 11', () => {
  expect(solver(EXAMPLE)).toEqual([ 37, 26 ]);
});
