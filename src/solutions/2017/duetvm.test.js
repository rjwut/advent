const DuetVm = require('./duetvm');

test('set', () => {
  const vm = new DuetVm();
  vm.load('set a 1');
  expect(vm.getRegister('a')).toBe(0);
  vm.run();
  expect(vm.getRegister('a')).toBe(1);
});

test('add (value)', () => {
  const vm = new DuetVm();
  vm.load('set a 1\nadd a 2');
  vm.run();
  expect(vm.getRegister('a')).toBe(3);
});

test('add (register)', () => {
  const vm = new DuetVm();
  vm.load('set a 1\nset b 2\nadd a b');
  vm.run();
  expect(vm.getRegister('a')).toBe(3);
});

test('mul (value)', () => {
  const vm = new DuetVm();
  vm.load('set a 2\nmul a 3');
  vm.run();
  expect(vm.getRegister('a')).toBe(6);
});

test('mul (register)', () => {
  const vm = new DuetVm();
  vm.load('set a 2\nset b 3\nmul a b');
  vm.run();
  expect(vm.getRegister('a')).toBe(6);
});

test('mod (value)', () => {
  const vm = new DuetVm();
  vm.load('set a 17\nmod a 5');
  vm.run();
  expect(vm.getRegister('a')).toBe(2);
});

test('mod (register)', () => {
  const vm = new DuetVm();
  vm.load('set a 17\nset b 5\nmod a b');
  vm.run();
  expect(vm.getRegister('a')).toBe(2);
});

test('jgz (check from value, jump from value)', () => {
  let vm = new DuetVm();
  vm.load('jgz 0 2\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(1);
  vm = new DuetVm();
  vm.load('jgz 1 2\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(0);
});

test('jgz (check from register, jump from value)', () => {
  let vm = new DuetVm();
  vm.load('jgz a 2\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(1);
  vm = new DuetVm();
  vm.load('set a 1\njgz a 2\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(0);
});

test('jgz (check on value, jump from register)', () => {
  let vm = new DuetVm();
  vm.load('set j 2\njgz 0 j\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(1);
  vm = new DuetVm();
  vm.load('set j 2\njgz 1 j\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(0);
});

test('jgz (check on register, jump from register)', () => {
  let vm = new DuetVm();
  vm.load('set j 2\njgz a j\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(1);
  vm = new DuetVm();
  vm.load('set a 1\nset j 2\njgz a j\nset b 1');
  vm.run();
  expect(vm.getRegister('b')).toBe(0);
});

test('snd and rcv (version 0, values)', () => {
  // Don't rcv if given a 0, terminate after successful rcv
  const vm = new DuetVm(0);
  vm.load('snd 2\nrcv 0\nsnd 7\nrcv 1\nsnd 4\nrcv 1');
  vm.run();
  expect(vm.lastSound).toBe(7);
});

test('snd and rcv (version 0, registers)', () => {
  const vm = new DuetVm(0);
  vm.load('set a 7\nsnd a\nrcv b\nrcv a\nsnd a\nrcv a');
  vm.run();
  expect(vm.lastSound).toBe(7);
});

test('snd (version 1, value)', () => {
  const vm = new DuetVm();
  vm.load('snd 7');
  vm.run();
  expect(vm.dequeueOutput()).toBe(7);
});

test('snd (version 1, register)', () => {
  const vm = new DuetVm();
  vm.load('set a 7\nsnd a');
  vm.run();
  expect(vm.dequeueOutput()).toBe(7);
});

test('rcv (version 1)', () => {
  const vm = new DuetVm();
  vm.load('rcv a');
  vm.run();
  expect(vm.getRegister('a')).toBe(0);
  expect(vm.state).toBe('blocked');
  expect(() => vm.run()).toThrow('VM is blocked on input');
  vm.enqueueInput(7);
  vm.run();
  expect(vm.getRegister('a')).toBe(7);
  expect(vm.state).toBe('terminated');
});
