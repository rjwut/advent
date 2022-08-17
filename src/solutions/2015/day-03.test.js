const solver = require('./day-03');

const EXAMPLES = [
  { input: '>', output: [ 2, 2 ] },
  { input: '^v', output: [ 2, 3 ] },
  { input: '^>v<', output: [ 4, 3 ] },
  { input: '^v^v^v^v^v', output: [ 2, 11 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 3, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
