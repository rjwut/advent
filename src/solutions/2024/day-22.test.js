const solver = require('./day-22');

test('Day 22', () => {
  expect(solver(`1
10
100
2024`)[0]).toBe(37327623);
  expect(solver(`1
2
3
2024`)[1]).toBe(23);
});
