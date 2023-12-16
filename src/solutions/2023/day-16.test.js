const solver = require('./day-16');

const EXAMPLE = `.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`;

test('Day 16', () => {
  expect(solver(EXAMPLE)).toEqual([ 46, 51 ]);
});
