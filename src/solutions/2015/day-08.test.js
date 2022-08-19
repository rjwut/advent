const solver = require('./day-08');

const EXAMPLES = [
  { input: `""
"abc"
"aaa\\"aaa"
"\\x27"`, output: [ 12, 19 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 8, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
