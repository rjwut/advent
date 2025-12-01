const solver = require('./day-01');

// Code for single example
const EXAMPLE = `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`;

test('Day 1', () => {
  expect(solver(EXAMPLE)).toEqual([ 3, 6 ]);
});
