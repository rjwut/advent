const solver = require('./day-14');

const EXAMPLE1 = `mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
mem[8] = 11
mem[7] = 101
mem[8] = 0`;
const EXAMPLE2 = `mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1`

test('Day 14', () => {
  expect(solver(EXAMPLE1, 1)).toEqual(165n);
  expect(solver(EXAMPLE2, 2)).toEqual(208n);
});
