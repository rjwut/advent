const solver = require('./day-18');

const EXAMPLE = `.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.`;

test('Day 18', () => {
  expect(solver(EXAMPLE, 1)).toBe(1147);
});
