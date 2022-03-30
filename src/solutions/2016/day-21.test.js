const solver = require('./day-21');

const EXAMPLE = `swap position 4 with position 0
swap letter d with letter b
reverse positions 0 through 4
rotate left 1 step
move position 1 to position 4
move position 3 to position 0
rotate based on position of letter b
rotate based on position of letter d`;

test('Day 21', () => {
  expect(solver.solve(EXAMPLE, 'abcde')).toBe('decab');
  expect(solver.solve(EXAMPLE, 'decab', true)).toBe('abcde');
});
