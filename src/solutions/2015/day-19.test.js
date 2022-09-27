const solver = require('./day-19');

/*
 * Note that the part two answers are off by one compared to the answers given
 * in the example in the puzzle text. This is because the `e` replacements
 * given there have only one output element, while the actual puzzle input
 * always specifies two. So we subtract one from the expected answer to
 * compensate.
 */
const EXAMPLES = [
  { input: 'H => HO\nH => OH\nO => HH\n\nHOH',    output: [ 4, 2 ] },
  { input: 'H => HO\nH => OH\nO => HH\n\nHOHOHO', output: [ 7, 5 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 19, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
