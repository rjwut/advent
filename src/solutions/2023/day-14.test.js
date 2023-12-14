const solver = require('./day-14');

const EXAMPLE = `O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`;

test('Day 14', () => {
  expect(solver(EXAMPLE)).toEqual([ 136, 64 ]);
});
