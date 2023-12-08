const solver = require('./day-08');

const EXAMPLE_1 = `RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`;

const EXAMPLE_2 = `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`;

const EXAMPLE_3 = `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`;

test('Day 8, example 1', () => {
  expect(solver(EXAMPLE_1, 0)).toBe(2);
});

test('Day 8, example 2', () => {
  expect(solver(EXAMPLE_2, 0)).toBe(6);
});

test('Day 8, example 3', () => {
  expect(solver(EXAMPLE_3, 1)).toBe(6);
});
