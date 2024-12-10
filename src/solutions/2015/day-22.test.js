const solver = require('./day-22');

test('Day 22, example 0', () => {
  const input = 'Hit Points: 13\nDamage: 8';
  const me = { hp: 10, mana: 250 };
  expect(solver(input, me)).toEqual([ 226, Infinity ]);
});

test('Day 22, example 1', () => {
  const input = 'Hit Points: 14\nDamage: 8';
  const me = { hp: 10, mana: 250 };
  expect(solver(input, me)).toEqual([ 641, Infinity ]);
});
