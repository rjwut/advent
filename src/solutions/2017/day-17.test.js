const solver = require('./day-17');

const EXAMPLE = '3';

test('Day 17', () => {
  expect(solver(EXAMPLE)).toEqual([ 638, 1222153 ]);
});
