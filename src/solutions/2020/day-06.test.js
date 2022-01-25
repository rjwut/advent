const solver = require('./day-06');

const EXAMPLE = `abc

a
b
c

ab
ac

a
a
a
a

b`;

test('Day 6', () => {
  expect(solver(EXAMPLE)).toEqual([ 11, 6 ]);
});
