const solver = require('./day-04');

// Code for single example
const EXAMPLE = `..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`;

test('Day 4', () => {
  expect(solver(EXAMPLE)).toEqual([ 13, 43 ]);
});

// Code for multiple examples
/*
const EXAMPLES = [
  { input: '', output: [ undefined, undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 4, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
*/
