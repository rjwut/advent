const Device = require('./day-17.device');

test('Opcode 0 (adv); A >> combo -> A', () => {
  const device = run(9, 2, 0, '0,5');
  expect(device.getRegister('A')).toBe(2n);
});

test('Opcode 1 (bxl); B XOR arg -> B', () => {
  const device = run(0, 5, 0, '1,10');
  expect(device.getRegister('B')).toBe(15n);
});

test('Opcode 2 (bst); combo & 7 -> B', () => {
  const device = run(0, 9, 0, '2,5');
  expect(device.getRegister('B')).toBe(1n);
});

test('Opcode 3 (jnz); ip -> arg if A !== 0', () => {
  let device = run(0, 0, 0, '3,4,5,0');
  expect(device.outputLength).toBe(1);
  device = run(1, 0, 0, '3,4,5,0');
  expect(device.outputLength).toBe(0);
});

test('Opcode 4 (bxc); B XOR C -> B', () => {
  const device = run(0, 5, 10, '4,0');
  expect(device.getRegister('B')).toBe(15n);
});

test('Opcode 5 (out); combo & 7 -> output', () => {
  const device = run(9, 0, 0, '5,4');
  expect(device.dequeueAllOutput()).toEqual([ 1n ]);
});

test('Opcode 6 (bdv); A >> combo -> B', () => {
  const device = run(6, 2, 0, '6,5');
  expect(device.getRegister('B')).toBe(1n);
});

test('Opcode 7 (cdv); A >> combo -> C', () => {
  const device = run(6, 2, 0, '7,5');
  expect(device.getRegister('C')).toBe(1n);
});

test('Combo operand 0: 0', () => {
  const device = run(0, 1, 0, '2,0');
  expect(device.getRegister('B')).toBe(0n);
});

test('Combo operand 1: 1', () => {
  const device = run(0, 0, 0, '2,1');
  expect(device.getRegister('B')).toBe(1n);
});

test('Combo operand 2: 2', () => {
  const device = run(0, 0, 0, '2,2');
  expect(device.getRegister('B')).toBe(2n);
});

test('Combo operand 3: 3', () => {
  const device = run(0, 0, 0, '2,3');
  expect(device.getRegister('B')).toBe(3n);
});

test('Combo operand 4: A', () => {
  const device = run(1, 0, 0, '2,4');
  expect(device.getRegister('B')).toBe(1n);
});

test('Combo operand 5: B', () => {
  const device = run(0, 9, 0, '2,5');
  expect(device.getRegister('B')).toBe(1n);
});

test('Combo operand 6: C', () => {
  const device = run(0, 0, 1, '2,6');
  expect(device.getRegister('B')).toBe(1n);
});

test('Combo operand 7: Error', () => {
  expect(() => run(0, 0, 0, '2,7')).toThrow('Invalid combo operand');
});

/**
 * If register C contains 9, the program 2,6 would set register B to 1.
 */
test('Test 0', () => {
  const device = run(0, 0, 9, '2,6');
  expect(device.getRegister('B')).toBe(1n);
});

/**
 * If register A contains 10, the program 5,0,5,1,5,4 would output 0,1,2.
 */
test('Test 1', () => {
  const device = run(10, 0, 0, '5,0,5,1,5,4');
  expect(device.dequeueAllOutput()).toEqual([ 0n, 1n, 2n ]);
});

/**
 * If register A contains 2024, the program 0,1,5,4,3,0 would output 4,2,5,6,7,7,7,7,3,1,0 and leave
 * 0 in register A.
 */
test('Test 2', () => {
  const device = run(2024, 0, 0, '0,1,5,4,3,0');
  expect(device.dequeueAllOutput()).toEqual([ 4n, 2n, 5n, 6n, 7n, 7n, 7n, 7n, 3n, 1n, 0n ]);
  expect(device.getRegister('A')).toBe(0n);
});

/**
 * If register B contains 29, the program 1,7 would set register B to 26.
 */
test('Test 3', () => {
  let device = run(0, 29, 0, '1,7');
  expect(device.getRegister('B')).toBe(26n);
});

/**
 * If register B contains 2024 and register C contains 43690, the program 4,0 would set register B
 * to 44354.
 */
test('Test 4', () => {
  const device = run(0, 2024, 43690, '4,0');
  expect(device.getRegister('B')).toBe(44354n);
});

const run = (a, b, c, program) => {
  const device = new Device();
  device.load(program);
  device.setRegister('A', a);
  device.setRegister('B', b);
  device.setRegister('C', c);
  device.run();
  return device;
};
