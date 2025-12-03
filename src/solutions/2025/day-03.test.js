const solver = require('./day-03');

// Code for single example
const EXAMPLE = `987654321111111
811111111111119
234234234234278
818181911112111`;

test('Day 3', () => {
  expect(solver(EXAMPLE)).toEqual([ 357, 3121910778619 ]);
});
