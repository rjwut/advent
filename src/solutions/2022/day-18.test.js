const solver = require('./day-18');

const EXAMPLES = [
  { input: '1,1,1\n2,1,1', output: [ 10, 10 ] },
  { input: `2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`, output: [ 64, 58 ] },
];

describe('Day 18 tests', () => {
  EXAMPLES.forEach(({ input, output }, i) => {
    test(`Day 18, example ${i}`, () => {
      expect(solver(input)).toEqual(output);
    });
  });
});
