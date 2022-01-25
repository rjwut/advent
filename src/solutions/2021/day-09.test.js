const solver = require('./day-09');

const EXAMPLE = `2199943210
3987894921
9856789892
8767896789
9899965678`;

test('Day 9', () => {
  expect(solver(EXAMPLE)).toEqual([ 15, 1134 ]);
});
