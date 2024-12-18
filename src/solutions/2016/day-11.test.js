const solver = require('./day-11');

/*
test('Day 11 simple test', () => {
  expect(solver(`The first floor contains a hydrogen-compatible microchip and a hydrogen generator.
The fourth floor contains nothing relevant.
The fourth floor contains nothing relevant.
The fourth floor contains nothing relevant.`)).toEqual([ 3, undefined ]);
});
*/

test('Day 11 example', () => {
  expect(solver(`The first floor contains a hydrogen-compatible microchip and a lithium-compatible microchip.
The second floor contains a hydrogen generator.
The third floor contains a lithium generator.
The fourth floor contains nothing relevant.`, true)).toBe(11);
});
