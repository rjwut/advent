const solver = require('./day-07');

const EXAMPLES = [
  { input: `123 -> x
456 -> y
x AND y -> d
x OR y -> e
x LSHIFT 2 -> f
y RSHIFT 2 -> g
NOT x -> h
NOT y -> i`, output: [ undefined, undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 7, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
