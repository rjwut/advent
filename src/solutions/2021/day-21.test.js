const solver = require('./day-21');

const EXAMPLE = `Player 1 starting position: 4
Player 2 starting position: 8`;

test('Day 21', () => {
  expect(solver(EXAMPLE)).toEqual([ 739785, 444356092776315 ]);
});
