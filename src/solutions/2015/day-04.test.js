const solver = require('./day-04');

const EXAMPLES = [
  { input: 'abcdef', output: [ 609043, 6742839 ] },
  { input: 'pqrstuv', output: [ 1048970, 5714438 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 4, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
