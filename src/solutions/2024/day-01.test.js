const solver = require('./day-01');

// Code for single example
const EXAMPLE = `3   4
4   3
2   5
1   3
3   9
3   3`;

test('Day 1', () => {
  expect(solver(EXAMPLE)).toEqual([ 11, 31 ]);
});

// Code for multiple examples
/*
const EXAMPLES = [
  { input: '', output: [ undefined, undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 1, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
*/
