const solver = require('./day-02');

const EXAMPLE = '2x3x4\n1x1x10';

test('Day 02', () => {
  expect(solver(EXAMPLE)).toEqual([ 101, 48 ]);
});
