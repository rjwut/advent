const solver = require('./day-23');

const PROGRAM = `inc a
jio a, +2
tpl a
inc a`;

test('Day 23', () => {
  expect(solver(PROGRAM)).toEqual([ 0, 0 ]);
});
