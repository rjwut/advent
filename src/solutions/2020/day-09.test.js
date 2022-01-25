const solver = require('./day-09');

const EXAMPLE = `35
20
15
25
47
40
62
55
65
95
102
117
150
182
127
219
299
277
309
576`;

test('Day 9', () => {
  expect(solver(EXAMPLE, 5)).toEqual([ 127, 62 ]);
});
