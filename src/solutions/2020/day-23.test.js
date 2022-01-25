const solver = require('./day-23');

const EXAMPLE = '389125467';

test('Day 23', () => {
  expect(solver(EXAMPLE)).toEqual([ '67384529', 149245887792 ]);
});
