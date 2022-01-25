const solver = require('./day-08');

const EXAMPLE = `nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`;

test('Day 8', () => {
  expect(solver(EXAMPLE)).toEqual([ 5, 8 ]);
});
