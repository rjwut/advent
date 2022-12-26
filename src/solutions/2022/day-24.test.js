const solver = require('./day-24');

const EXAMPLE = `#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#`;

test('Day 24', () => {
  expect(solver(EXAMPLE)).toEqual([ 18, 54 ]);
});
