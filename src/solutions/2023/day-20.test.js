const solver = require('./day-20');

const EXAMPLES = [
  { input: `broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`, output: 32000000 },
  { input: `broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`, output: 11687500 },
];
/*
EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 20, example ${i}`, () => {
    expect(solver(input, 0)).toBe(output);
  });
});
*/
test('Day 20, example 0', () => {
  expect(solver(EXAMPLES[0].input, 0)).toBe(EXAMPLES[0].output);
});

test('Day 20, example 1', () => {
  expect(solver(EXAMPLES[1].input, 0)).toBe(EXAMPLES[1].output);
});
