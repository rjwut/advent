const solver = require('./day-17');

test('Day 17, part 1', () => {
  expect(solver(`Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0`, 1)).toEqual('4,6,3,5,6,3,5,2,1,0');
});
