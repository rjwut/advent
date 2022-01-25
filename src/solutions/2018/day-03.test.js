const solver = require('./day-03');

const EXAMPLE = `#1 @ 1,3: 4x4
#2 @ 3,1: 4x4
#3 @ 5,5: 2x2`;

test('Day 3', () => {
  expect(solver(EXAMPLE)).toEqual([ 4, 3 ]);
});
