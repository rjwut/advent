const solver = require('./day-10');

const EXAMPLES = [
  { input: '211', output: '1221' },
  { input: '1', output: '11' },
  { input: '11', output: '21' },
  { input: '21', output: '1211' },
  { input: '1211', output: '111221' },
  { input: '111221', output: '312211' },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 10, example ${i}`, () => {
    expect(solver.lookAndSayOnce(input)).toEqual(output);
  });
});
