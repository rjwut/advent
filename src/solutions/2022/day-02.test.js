const solver = require('./day-02');

const EXAMPLE = `A Y
B X
C Z`;

test('Day 2', () => {
  expect(solver(EXAMPLE)).toEqual([ 15, 12 ]);
});
