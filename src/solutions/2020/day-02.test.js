const solver = require('./day-02');

const EXAMPLE = `1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`;

test('Day 2', () => {
  expect(solver(EXAMPLE)).toEqual([ 2, 1 ]);
});
