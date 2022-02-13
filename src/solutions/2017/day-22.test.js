const solver = require('./day-22');

const EXAMPLE = '..#\n#..\n...';

test('Day 22', () => {
  expect(solver(EXAMPLE)).toEqual([ 5587, 2511944 ]);
});
