const solver = require('./day-14');

// Code for single example
const EXAMPLE = `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9`;

test('Day 14', () => {
  expect(solver(EXAMPLE)).toEqual([ 24, 93 ]);
});

// Code for multiple examples
/*
const EXAMPLES = [
  { input: '', output: [ undefined, undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 14, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
*/
