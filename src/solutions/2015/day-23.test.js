const solver = require('./day-23');

const PROGRAM = `inc a
jio a, +2
tpl a
inc a`;

test('Day 23', () => {
  let vm = new solver.Vm(PROGRAM);
  vm.run();
  expect(vm.get('a')).toBe(2);
  expect(vm.get('b')).toBe(0);
  vm = new solver.Vm(PROGRAM);
  vm.set('a', 1);
  vm.run();
  expect(vm.get('a')).toBe(7);
  expect(vm.get('b')).toBe(0);
});
