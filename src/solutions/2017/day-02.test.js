const solver = require('./day-02');

test('Day 2', () => {
  expect(solver(`5\t1\t9\t5
7\t5\t3
2\t4\t6\t8`, 1)).toEqual(18);
  expect(solver(`5\t9\t2\t8
9\t4\t7\t3
3\t8\t6\t5`, 2)).toEqual(9);
});
