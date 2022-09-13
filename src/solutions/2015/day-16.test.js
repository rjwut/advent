const solver = require('./day-16');

const EXAMPLE = `Sue 1: goldfish: 4, cats: 9, children: 3
Sue 2: goldfish: 5, cars: 1
Sue 3: samoyeds: 2, trees: 3
Sue 4: vizslas: 0, cats: 7`;

test('Day 16', () => {
  expect(solver(EXAMPLE)).toEqual([ 3, 1 ]);
});
