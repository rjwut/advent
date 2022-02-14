const solver = require('./day-05');

const EXAMPLE = 'abc';

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ '18f47a30', '05ace8e3' ]);
});
