const solver = require('./day-20');

const EXAMPLE = `5-8
0-2
4-7`;

test('Day 20', () => {
  expect(solver(EXAMPLE)).toEqual([ 3, undefined ]);
});
