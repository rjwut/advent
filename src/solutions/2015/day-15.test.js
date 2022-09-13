const solver = require('./day-15');

const EXAMPLE = `Butterscotch: capacity -1, durability -2, flavor 6, texture 3, calories 8
Cinnamon: capacity 2, durability 3, flavor -2, texture -1, calories 3`;

test('Day 15', () => {
  expect(solver(EXAMPLE)).toEqual([ 62842880, 57600000 ]);
});
