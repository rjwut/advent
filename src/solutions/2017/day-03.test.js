const solver = require('./day-03');

const EXAMPLES = [
  {
    input: '1',
    part: 1,
    output: 0,
  },
  {
    input: '12',
    part: 1,
    output: 3,
  },
  {
    input: '23',
    part: 1,
    output: 2,
  },
  {
    input: '1024',
    part: 1,
    output: 31,
  },
];

test.each(EXAMPLES)('Day 3', ({ input, part, output }) => {
  expect(solver(input, part)).toEqual(output);
});
