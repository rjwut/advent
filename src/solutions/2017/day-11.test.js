const solver = require('./day-11');

const EXAMPLES = [
  {
    input: 'ne,ne,ne',
    output: [ 3, 3 ],
  },
  {
    input: 'ne,ne,sw,sw',
    output: [ 0, 2 ],
  },
  {
    input: 'ne,ne,s,s',
    output: [ 2, 2 ],
  },
  {
    input: 'se,sw,se,sw,sw',
    output: [ 3, 3 ],
  },
];

test.each(EXAMPLES)('Day 11', ({ input, output }) => {
  expect(solver(input)).toEqual(output);
});
