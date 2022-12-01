const solver = require('./day-01');

const EXAMPLE = `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`

test('Day 1', () => {
  expect(solver(EXAMPLE)).toEqual([ 24000, 45000 ]);
});
