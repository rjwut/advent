const solver = require('./day-20');

const EXAMPLES = [
  { input: '150', output: [ 8, 8 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 20, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
