const solver = require('./day-15');

const EXAMPLE = `1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`;

test('Day 15', () => {
  expect(solver(EXAMPLE)).toEqual([ 40, 315 ]);
});
