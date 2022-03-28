const solver = require('./day-10');

const EXAMPLE = `value 5 goes to bot 2
bot 2 gives low to bot 1 and high to bot 0
value 3 goes to bot 1
bot 1 gives low to output 1 and high to bot 0
bot 0 gives low to output 2 and high to output 0
value 2 goes to bot 2`;

test('Day 10', () => {
  expect(solver(EXAMPLE, [ 2, 5 ])).toEqual([ 2, undefined ]);
});
