const solver = require('./day-21');

const EXAMPLE = `029A
980A
179A
456A
379A`;

test('Day 21', () => {
  expect(solver(EXAMPLE)).toEqual([ 126384, 154115708116294 ]);
});
