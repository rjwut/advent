const solver = require('./day-01');

const EXAMPLES = [
  {
    input: 'R2, L3',
    output: [ 5, undefined ],
  },
  {
    input: 'R2, R2, R2',
    output: [ 2, undefined ],
  },
  {
    input: 'R5, L5, R5, R3',
    output: [ 12, undefined ],
  },
  {
    input: 'R8, R4, R4, R8',
    output: [ 8, 4 ],
  }
];

test.each(EXAMPLES)('Day 1', ({ input, output }) => {
  expect(solver(input)).toEqual(output);
});
