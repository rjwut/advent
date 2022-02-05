const solver = require('./day-14');

const EXAMPLE = 'flqrgnkx';

test('Day 14', () => {
  expect(solver(EXAMPLE)).toEqual([ 8108, 1242 ]);
});
