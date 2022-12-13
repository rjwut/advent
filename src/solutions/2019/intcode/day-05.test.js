const IntcodeVm = require('.');

const PART_2_TESTS = [
  {
    program: '3,9,8,9,10,9,4,9,99,-1,8',
    tests: [
      { input: 8, output: 1 },
      { input: 7, output: 0 },
    ],
  },
  {
    program: '3,9,7,9,10,9,4,9,99,-1,8',
    tests: [
      { input: 8, output: 0 },
      { input: 7, output: 1 },
    ],
  },
  {
    program: '3,3,1108,-1,8,3,4,3,99',
    tests: [
      { input: 8, output: 1 },
      { input: 7, output: 0 },
    ],
  },
  {
    program: '3,3,1107,-1,8,3,4,3,99',
    tests: [
      { input: 8, output: 0 },
      { input: 7, output: 1 },
    ],
  },
  {
    program: '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9',
    tests: [
      { input: 0, output: 0 },
      { input: 7, output: 1 },
    ],
  },
  {
    program: '3,3,1105,-1,9,1101,0,0,12,4,12,99,1',
    tests: [
      { input: 0, output: 0 },
      { input: 7, output: 1 },
    ],
  },
  {
    program: '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99',
    tests: [
      { input: 7, output: 999 },
      { input: 8, output: 1000 },
      { input: 9, output: 1001 },
    ],
  },
];

test('Day 5 I/O example', () => {
  const vm = new IntcodeVm();
  vm.load('3,0,4,0,99');
  vm.enqueueInput(47);
  vm.on('output', value => {
    expect(value).toBe(47);
  });
  vm.run();
});

test('Day 5 parameter mode example', () => {
  const vm = new IntcodeVm();
  vm.load('1002,4,3,4,33');
  vm.run();
  expect(vm.program.memory[4]).toBe(99);
});

test('Day 5 negative example', () => {
  const vm = new IntcodeVm();
  vm.load('1101,100,-1,4,0');
  vm.run();
  expect(vm.program.memory[4]).toBe(99);
});

test('Day 5 part 2 examples', () => {
  PART_2_TESTS.forEach(({ program, tests }) => {
    tests.forEach(({ input, output }) => {
      const vm = new IntcodeVm();
      vm.load(program);
      vm.enqueueInput(input);
      vm.on('output', value => {
        expect(value).toBe(output);
      });
      vm.run();
    });
  });
});
