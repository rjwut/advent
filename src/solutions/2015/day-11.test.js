const solver = require('./day-11');

const EXAMPLES = [
  { input: 'abcdefgh', output: [ 'abcdffaa', undefined ] },
  { input: 'ghijklmn', output: [ 'ghjaabcc', undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 11, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
