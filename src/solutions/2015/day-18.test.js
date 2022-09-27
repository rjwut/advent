const solver = require('./day-18');

const EXAMPLE = `.#.#.#
...##.
#....#
..#...
#.#..#
####..`;

test('Day 18', () => {
  expect(solver(EXAMPLE, 4)).toEqual([ 4, 14 ]);
  expect(solver(EXAMPLE, 5)).toEqual([ 4, 17 ]);
});
