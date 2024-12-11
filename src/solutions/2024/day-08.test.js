const solver = require('./day-08');

const EXAMPLE = `............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`;

test('Day 8', () => {
  expect(solver(EXAMPLE)).toEqual([ 14, 34 ]);
});