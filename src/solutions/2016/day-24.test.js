const solver = require('./day-24');

const EXAMPLE = `###########
#0.1.....2#
#.#######.#
#4.......3#
###########`;

test('Day 24', () => {
  expect(solver(EXAMPLE)).toEqual([ 14, 20 ]);
});
