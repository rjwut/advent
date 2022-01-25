const solver = require('./day-17');

const EXAMPLE = `target area: x=20..30, y=-10..-5`;

test('Day 17', () => {
  expect(solver(EXAMPLE)).toEqual([ 45, 112 ]);
});
