const solver = require('./day-18');

const EXAMPLE_1 = `set a 1
add a 2
mul a a
mod a 5
snd a
set a 0
rcv a
jgz a -1
set a 1
jgz a -2`;
const EXAMPLE_2 = `snd 1
snd 2
snd p
rcv a
rcv b
rcv c
rcv d`;

test('Day 18', () => {
  expect(solver(EXAMPLE_1, 1)).toEqual(4);
  expect(solver(EXAMPLE_2, 2)).toEqual(3);
});
