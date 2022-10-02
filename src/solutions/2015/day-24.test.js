const solver = require('./day-24');

const EXAMPLE = '1\n2\n3\n4\n5\n7\n8\n9\n10\n11';

test('Day 24', () => {
  expect(solver(EXAMPLE)).toEqual([ 99, 44 ]);
});
