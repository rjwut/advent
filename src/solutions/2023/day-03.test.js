const solver = require('./day-03');

const EXAMPLE = `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`;

test('Day 3', () => {
  expect(solver(EXAMPLE)).toEqual([ 4361, 467835 ]);
});
