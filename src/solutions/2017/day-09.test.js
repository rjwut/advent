const solver = require('./day-09');

const EXAMPLES = [
  {
    input: '{}',
    output: [ 1, 0 ],
  },
  {
    input: '{{{}}}',
    output: [ 6, 0 ],
  },
  {
    input: '{{},{}}',
    output: [ 5, 0 ],
  },
  {
    input: '{{{},{},{{}}}}',
    output: [ 16, 0 ],
  },
  {
    input: '{<a>,<a>,<a>,<a>}',
    output: [ 1, 4 ],
  },
  {
    input: '{{<ab>},{<ab>},{<ab>},{<ab>}}',
    output: [ 9, 8 ],
  },
  {
    input: '{{<!!>},{<!!>},{<!!>},{<!!>}}',
    output: [ 9, 0 ],
  },
  {
    input: '{{<a!>},{<a!>},{<a!>},{<ab>}}',
    output: [ 3, 17 ],
  },
];

test.each(EXAMPLES)('Day 9', ({ input, output }) => {
  expect(solver(input)).toEqual(output);
});
