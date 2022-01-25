const solver = require('./day-07');

const EXAMPLE = `16,1,2,0,4,2,7,1,2,14`;

test('Day 7', () => {
  const result = solver(EXAMPLE);
  expect(result).toEqual([ 37, 168 ]);
});
