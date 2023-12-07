const solver = require('./day-07');

const EXAMPLE = `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`;

test('Day 7', () => {
  expect(solver(EXAMPLE)).toEqual([ 6440, 5905 ]);
});
