const solver = require('./day-11');

const EXAMPLE = '125 17';

test('Day 11', () => {
  expect(solver(EXAMPLE)).toEqual([55312, 65601038650482 ]);
});
