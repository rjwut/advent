const solver = require('./day-05');

const EXAMPLES = [
  { input: 'ugknbfddgicrmopn', output: [ 1, 0 ] },
  { input: 'aaa',              output: [ 1, 0 ] },
  { input: 'jchzalrnumimnmhp', output: [ 0, 0 ] },
  { input: 'haegwjzuvuyypxyu', output: [ 0, 0 ] },
  { input: 'dvszwmarrgswjxmb', output: [ 0, 0 ] },
  { input: 'qjhvhtzxzqqjkmpb', output: [ 0, 1 ] },
  { input: 'xxyxx',            output: [ 0, 1 ] },
  { input: 'uurcxstgmygtbstg', output: [ 0, 0 ] },
  { input: 'ieodomkazucvgmuy', output: [ 0, 0 ] },
  ];
EXAMPLES.push({
  input: EXAMPLES.map(({ input }) => input).join('\n'),
  output: EXAMPLES.reduce((sums, { output }) => [ sums[0] + output[0], sums[1] + output[1] ], [ 0, 0 ]),
});
console.log(EXAMPLES);

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 5, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
