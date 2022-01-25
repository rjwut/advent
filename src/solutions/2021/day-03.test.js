const solver = require('./day-03');

const EXAMPLE = `00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010`;

test('Day 3', () => {
  expect(solver(EXAMPLE)).toEqual([ 198, 230 ]);
});
