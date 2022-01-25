const solver = require('./day-01');

const EXAMPLES = [
  {
    input: '+1\n-2\n+3\n+1',
    part: 1,
    output: 3,
  },
  {
    input: '+1\n+1\n+1',
    part: 1,
    output: 3,
  },
  {
    input: '+1\n+1\n-2',
    part: 1,
    output: 0,
  },
  {
    input: '-1\n-2\n-3',
    part: 1,
    output: -6,
  },
  {
    input: '+1\n-2\n+3\n+1',
    part: 2,
    output: 2,
  },
  {
    input: '+1\n-1',
    part: 2,
    output: 0,
  },
  {
    input: '+3\n+3\n+4\n-2\n-4',
    part: 2,
    output: 10,
  },
  {
    input: '-6\n+3\n+8\n+5\n-6',
    part: 2,
    output: 5,
  },
  {
    input: '+7\n+7\n-2\n-7\n-4',
    part: 2,
    output: 14,
  },
];

test.each(EXAMPLES)('Day 1', example => {
  expect(solver(example.input, example.part)).toEqual(example.output);
});
