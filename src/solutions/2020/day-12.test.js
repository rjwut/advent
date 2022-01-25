const solver = require('./day-12');

const EXAMPLE = `F10
N3
F7
R90
F11`;

test('Day 12', () => {
  expect(solver(EXAMPLE)).toEqual([ 25, 286 ]);
});
