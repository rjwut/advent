const solver = require('./day-15');

const EXAMPLE = `Generator A starts with 65
Generator B starts with 8921`;

test('Day 15', () => {
  expect(solver(EXAMPLE)).toEqual([ 588, 309 ]);
});
