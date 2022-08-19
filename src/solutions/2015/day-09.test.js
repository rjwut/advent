const solver = require('./day-09');

const EXAMPLE = `London to Dublin = 464
London to Belfast = 518
Dublin to Belfast = 141`;

test('Day 9', () => {
  expect(solver(EXAMPLE)).toEqual([ 605, 982 ]);
});
