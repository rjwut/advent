const solver = require('./day-11');

const EXAMPLE = `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

test('Day 11', () => {
  expect(solver(EXAMPLE)).toEqual([ 374, 82000210 ]);
});
