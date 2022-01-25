const solver = require('./day-02');

const EXAMPLE = `forward 5
down 5
forward 8
up 3
down 8
forward 2`;

test('Day 2', () => {
  expect(solver(EXAMPLE)).toEqual([ 150, 900 ]);
});
