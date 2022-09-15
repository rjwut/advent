const solver = require('./day-17');

const EXAMPLE = '20\n15\n10\n5\n5';

test('Day 17', () => {
  expect(solver(EXAMPLE, 25)).toEqual([ 4, 3 ]);
});
