const solver = require('./day-10');

test('Day 10, example 0', () => {
  expect(solver(`0123
1234
8765
9876`)).toEqual([ 1, 16 ]);
});

test('Day 10, example 1', () => {
  expect(solver(`89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732`)).toEqual([ 36, 81 ]);
});
