const solver = require('./day-15');

const EXAMPLE = `Disc #1 has 5 positions; at time=0, it is at position 4.
Disc #2 has 2 positions; at time=0, it is at position 1.`;

test('Day 15', () => {
  expect(solver(EXAMPLE)).toEqual([ 5, 85 ]);
});
