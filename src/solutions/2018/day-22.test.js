const solver = require('./day-22');

const EXAMPLE = 'depth: 510\ntarget: 10,10';

test('Day 22', () => {
  expect(solver(EXAMPLE)).toEqual([ 114, 45 ]);
});
