const solver = require('./day-14');

const EXAMPLE = 'abc';

test('Day 14', () => {
  expect(solver(EXAMPLE)).toEqual([ 22728, 22551 ]);
});
