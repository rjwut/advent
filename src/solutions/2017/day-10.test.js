const solver = require('./day-10');

const EXAMPLE = '3,4,1,5';

test('Day 10', () => {
  expect(solver(EXAMPLE, 1, 5)).toEqual(12);
});
