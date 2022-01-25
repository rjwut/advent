const solver = require('./day-16');

const EXAMPLE1 = `class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12`;

const EXAMPLE2 = `departure class: 0-1 or 4-19
row: 0-5 or 8-19
departure seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9`;

test('Day 16', () => {
  expect(solver(EXAMPLE1, 1)).toBe(71);
  expect(solver(EXAMPLE2, 2)).toBe(156);
});
