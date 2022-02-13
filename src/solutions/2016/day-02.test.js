const solver = require('./day-02');

const EXAMPLE = `ULL
RRDDD
LURDL
UUUUD`;

test('Day 2', () => {
  expect(solver(EXAMPLE)).toEqual([ '1985', '5DB3' ]);
});
