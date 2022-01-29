const solver = require('./day-08');

const EXAMPLE = `b inc 5 if a > 1
a inc 1 if b < 5
c dec -10 if a >= 1
c inc -20 if c == 10`;

test('Day 8', () => {
  expect(solver(EXAMPLE)).toEqual([ 1, 10 ]);
});
