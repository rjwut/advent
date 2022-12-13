const IntcodeVm = require('.');

const TESTS = [
  {
    program: '1,9,10,3,2,3,11,0,99,30,40,50',
    endState: '3500,9,10,70,2,3,11,0,99,30,40,50',
  },
  {
    program: '1,0,0,0,99',
    endState: '2,0,0,0,99',
  },
  {
    program: '2,3,0,3,99',
    endState: '2,3,0,6,99',
  },
  {
    program: '2,4,4,5,99,0',
    endState: '2,4,4,5,99,9801',
  },
  {
    program: '1,1,1,4,99,5,6,0,99',
    endState: '30,1,1,4,2,5,6,0,99',
  },
]

test('Day 2 examples', () => {
  TESTS.forEach(({ program, endState }) => {
    const vm = new IntcodeVm();
    vm.load(program);
    vm.run();
    expect(vm.program.memory.join(',')).toBe(endState);
  });
});
