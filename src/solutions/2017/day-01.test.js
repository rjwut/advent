const solver = require('./day-01');

const EXAMPLES = [
  {
    input: '1122',
    part: 1,
    output: 3,
  },
  {
    input: '1111',
    part: 1,
    output: 4,
  },
  {
    input: '1234',
    part: 1,
    output: 0,
  },
  {
    input: '91212129',
    part: 1,
    output: 9,
  },
  {
    input: '1212',
    part: 2,
    output: 6,
  },
  {
    input: '1221',
    part: 2,
    output: 0,
  },
  {
    input: '123425',
    part: 2,
    output: 4,
  },
  {
    input: '123123',
    part: 2,
    output: 12,
  },
  {
    input: '12131415',
    part: 2,
    output: 4,
  },
];

test.each(EXAMPLES)('Day 1', ({ input, part, output }) => {
  expect(solver(input, part)).toEqual(output);
});
