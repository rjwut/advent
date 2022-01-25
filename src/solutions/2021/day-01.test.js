const solver = require('./day-01');

const EXAMPLE = `199
200
208
210
200
207
240
269
260
263`;

test('Day 1', () => {
  expect(solver(EXAMPLE)).toEqual([ 7, 5 ]);
});
