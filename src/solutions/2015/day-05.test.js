const solver = require('./day-05');

const EXAMPLES = [
  { input: 'ugknbfddgicrmopn', output: [ 1, undefined ] },
  { input: 'aaa',              output: [ 1, undefined ] },
  { input: 'jchzalrnumimnmhp', output: [ 0, undefined ] },
  { input: 'haegwjzuvuyypxyu', output: [ 0, undefined ] },
  { input: 'dvszwmarrgswjxmb', output: [ 0, undefined ] },
];
EXAMPLES.push({
  input: EXAMPLES.map(({ input }) => input).join('\n'),
  output: [ EXAMPLES.reduce((sum, { output }) => sum + output[0], 0), undefined ],
})

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 5, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
