const solver = require('./day-08');

// Code for single example
const EXAMPLE = `30373
25512
65332
33549
35390`;

test('Day 8', () => {
  expect(solver(EXAMPLE)).toEqual([ 21, 8 ]);
});

// Code for multiple examples
/*
const EXAMPLES = [
  { input: '', output: [ undefined, undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 8, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
*/
