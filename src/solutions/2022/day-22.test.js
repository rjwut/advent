const solver = require('./day-22');

const EXAMPLE = `        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`;

test('Day 22', () => {
  expect(solver(EXAMPLE)).toEqual([ 6032, 5031 ]);
});
