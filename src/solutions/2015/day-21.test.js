const solver = require('./day-21');

const ME = { hp: 8, damage: 5, armor: 5 };
const BOSS = { hp: 12, damage: 7, armor: 2 };

test(`Example battle`, () => {
  expect(solver.battle(ME, BOSS)).toBe(true);
});
