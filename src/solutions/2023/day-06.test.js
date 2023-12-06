const solver = require('./day-06');

const EXAMPLE = `Time:      7  15   30
Distance:  9  40  200`;

test('Day 6', () => {
  expect(solver(EXAMPLE)).toEqual([ 288, 71503 ]);
});
