const solver = require('./day-25');

const EXAMPLE = `1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`;

test('Day 25', () => {
  expect(solver(EXAMPLE)).toEqual([ '2=-1=0', undefined ]);
});
