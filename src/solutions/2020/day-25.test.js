const solver = require('./day-25');

const EXAMPLE = '5764801\n17807724';

test('Day 25', () => {
  expect(solver(EXAMPLE)).toEqual([ 14897079, undefined ]);
});
