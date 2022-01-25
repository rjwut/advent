const solver = require('./day-23');

const EXAMPLE = `#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########`;

test('Day 23', () => {
  expect(solver(EXAMPLE)).toEqual([ 12521, 44169 ]);
});
