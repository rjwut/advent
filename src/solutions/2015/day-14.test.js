const solver = require('./day-14');

const EXAMPLE = `Comet can fly 14 km/s for 10 seconds, but then must rest for 127 seconds.
Dancer can fly 16 km/s for 11 seconds, but then must rest for 162 seconds.`;

test('Day 14', () => {
  expect(solver(EXAMPLE, 1000)).toEqual([ 1120, 689 ]);
});
