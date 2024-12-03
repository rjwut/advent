const solver = require('./day-03');

// Code for single example
const EXAMPLES = [
  {
    input: 'xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))',
    output: [ 161, 161 ],
  },
  {
    input: 'xmul(2,4)&mul[3,7]!^don\'t()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))',
    output: [ 161, 48 ],
  },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 3, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
