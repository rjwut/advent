const solver = require('./day-01');

const EXAMPLE = `1721
979
366
299
675
1456`;

test('Day 1', () => {
  expect(solver(EXAMPLE)).toEqual([ 514579, 241861950 ]);
});
