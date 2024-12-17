const solver = require('./day-17');
const programFn = require('./day-17.reverse-engineered');

test('Day 17, part 1', () => {
  expect(solver(`Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0`, 1)).toEqual('4,6,3,5,6,3,5,2,1,0');
});

test('Reverse engineered program', () => {
  expect(programFn(22571680)).toEqual([ 2, 0, 1, 3, 4, 0, 2, 1, 7 ]);
});
