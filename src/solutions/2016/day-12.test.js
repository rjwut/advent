const solver = require('./day-12');

const EXAMPLE = `cpy 41 a
inc a
inc a
dec a
jnz a 2
dec a`;

test('Day 12', () => {
  expect(solver(EXAMPLE)).toEqual([ 42, 42 ]);
});
