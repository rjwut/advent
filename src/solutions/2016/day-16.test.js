const solver = require('./day-16');

const EXAMPLE = '10000';

test('Day 16', () => {
  expect(solver.solve(EXAMPLE, 20)).toEqual('01100');
});
