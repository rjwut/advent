const solver = require('./day-09');

const EXAMPLE = `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`;

test('Day 9', () => {
  expect(solver(EXAMPLE)).toEqual([ 114, 2 ]);
});
