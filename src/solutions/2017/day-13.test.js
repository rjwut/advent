const solver = require('./day-13');

const EXAMPLE = `0: 3
1: 2
4: 4
6: 4`;

test('Day 13', () => {
  expect(solver(EXAMPLE)).toEqual([ 24, 10 ]);
});
