const solver = require('./day-12');

const EXAMPLE = `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`;

test('Day 12', () => {
  expect(solver(EXAMPLE)).toEqual([ 31, 29 ]);
});
