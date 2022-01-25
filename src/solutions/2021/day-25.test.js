const solver = require('./day-25');

const EXAMPLE = `v...>>.vv>
.vv>>.vv..
>>.>v>...v
>>v>>.>.v.
v>v.vv.v..
>.>>..v...
.vv..>.>v.
v.v..>>v.v
....v..v.>`;

test('Day 25', () => {
  expect(solver(EXAMPLE)).toEqual([ 58, undefined ]);
});
