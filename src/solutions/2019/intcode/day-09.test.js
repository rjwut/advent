const IntcodeVm = require('.');

const TESTS = [
  {
    program: '109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99',
    output: '109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99',
  },
  {
    program: '1102,34915192,34915192,7,4,7,99,',
    output: '1219070632396864',
  },
  {
    program: '104,1125899906842624,99',
    output: '1125899906842624',
  },
];

test('Day 9 examples', () => {
  TESTS.forEach(({ program, output }) => {
    const vm = new IntcodeVm();
    vm.load(program);
    vm.run();
    expect(vm.dequeueAllOutput().join(',')).toBe(output);
  });
});
