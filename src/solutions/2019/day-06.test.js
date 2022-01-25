const solver = require('./day-06');

const EXAMPLE_1 = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`;
const EXAMPLE_2 = EXAMPLE_1 + '\nK)YOU\nI)SAN';

test('Day 6', () => {
  expect(solver(EXAMPLE_1, 1)).toBe(42);
  expect(solver(EXAMPLE_2, 2)).toBe(4);
});
