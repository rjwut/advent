const solver = require('./day-12');

test('Day 12, example 0', () => {
  expect(solver(`AAAA
BBCD
BBCC
EEEC`)).toEqual([ 140, 80 ]);
});

test('Day 12, example 1', () => {
  expect(solver(`OOOOO
OXOXO
OOOOO
OXOXO
OOOOO`)).toEqual([ 772, 436 ]);
});

test('Day 12, example 2', () => {
  expect(solver(`RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE`)).toEqual([ 1930, 1206 ]);
});

test('Day 12, example 3', () => {
  expect(solver(`EEEEE
EXXXX
EEEEE
EXXXX
EEEEE`)).toEqual([ 692, 236 ]);
});

test('Day 12, example 4', () => {
  expect(solver(`AAAAAA
AAABBA
AAABBA
ABBAAA
ABBAAA
AAAAAA`)).toEqual([ 1184, 368 ]);
});
