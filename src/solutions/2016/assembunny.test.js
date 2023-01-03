const AssembunnyVm = require('./assembunny');

test('Day 12 example', () => {
  const vm = new AssembunnyVm();
  vm.load(`cpy 41 a
inc a
inc a
dec a
jnz a 2
dec a`);
  vm.run();
  expect(vm.getRegister('a')).toBe(42);
});

test('Day 23 example', () => {
  const vm = new AssembunnyVm();
  vm.load(`cpy 2 a
tgl a
tgl a
tgl a
cpy 1 a
dec a
dec a`);
  vm.run();
  expect(vm.getRegister('a')).toBe(3);
});
