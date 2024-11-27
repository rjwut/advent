const solver = require('./day-21');

const EXAMPLE = `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`;

test('Day 21', () => {
  expect(solver(EXAMPLE, 6)).toBe(16);
});
