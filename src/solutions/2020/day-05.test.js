const solver = require('./day-05');

const EXAMPLE = `FBFBBFFRLR
BFFFBBFRRR
FFFBBBFRRR
BBFFBBFRLL`;

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 820, undefined ]);
});
