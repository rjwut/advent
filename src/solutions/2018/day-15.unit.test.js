const Unit = require('./day-15.unit');

test('Day 15 - unit', () => {
  const unit = new Unit(4, 7, 'E', 5);
  expect(unit.r).toBe(4);
  expect(unit.c).toBe(7);
  expect(unit.faction).toBe('E');
  expect(unit.hp).toBe(5);
  expect(unit.alive).toBe(true);
  unit.move(4, 8);
  expect(unit.r).toBe(4);
  expect(unit.c).toBe(8);
  unit.move(3, 8);
  expect(unit.r).toBe(3);
  expect(unit.c).toBe(8);
  unit.hit(3);
  expect(unit.hp).toBe(2);
  expect(unit.alive).toBe(true);
  unit.hit(3);
  expect(unit.hp).toBe(0);
  expect(unit.alive).toBe(false);
  const other = new Unit(4, 4, 'G', 5);
  expect(unit.distance(other)).toBe(5);
});
