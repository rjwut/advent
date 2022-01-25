const solver = require('./day-05');

const EXAMPLE = 'dabAcCaCBAcCcaDA';

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 10, 4 ]);
});
