const solver = require('./day-11');

const EXAMPLE = `The first floor contains a hydrogen-compatible microchip and a lithium-compatible microchip.
The second floor contains a hydrogen generator.
The third floor contains a lithium generator.
The fourth floor contains nothing relevant.`;

test('Day 11', () => {
  expect(solver(EXAMPLE)).toEqual([ 11, undefined ]);
});
