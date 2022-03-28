const solver = require('./day-13');

const EXAMPLE = '10';

test('Day 13', () => {
  expect(solver(EXAMPLE, [ 7, 4 ])).toEqual([ 11, 153 ]);
});
