const solver = require('./day-09');

const EXAMPLES = [
  { input: 'R 4\nU 4\nL 3\nD 1\nR 4\nD 1\nL 5\nR 2', output: [ 13, 1 ] },
  { input: 'R 5\nU 8\nL 8\nD 3\nR 17\nD 10\nL 25\nU 20', output: [ 88, 36 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 9, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
