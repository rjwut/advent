const solver = require('./day-18');

const EXAMPLE = '.^^.^.^^^^';

test('Day 18', () => {
  expect(solver.solve(EXAMPLE, [ 10 ] )).toEqual([ 38 ]);
});
