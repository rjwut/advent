const solver = require('./day-09');

const EXAMPLES = [
  { input: 'ADVENT', part: 1, output: 6 },
  { input: 'A(1x5)BC', part: 1, output: 7 },
  { input: '(3x3)XYZ', part: 1, output: 9 },
  { input: 'A(2x2)BCD(2x2)EFG', part: 1, output: 11 },
  { input: '(6x1)(1x3)A', part: 1, output: 6 },
  { input: 'X(8x2)(3x3)ABCY', part: 1, output: 18 },
  { input: '(3x3)XYZ', part: 2, output: 9 },
  { input: 'X(8x2)(3x3)ABCY', part: 2, output: 20 },
  { input: '(27x12)(20x12)(13x14)(7x10)(1x12)A', part: 2, output: 241920 },
  { input: '(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN', part: 2, output: 445 },
];

test.each(EXAMPLES)('Day 9', ({ input, part, output }) => {
  expect(solver(input, part)).toBe(output);
});
