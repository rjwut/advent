const solver = require('./day-11');

// Code for single example
const EXAMPLE1 = `aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out`;

const EXAMPLE2 = `svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out`;

test('Day 11', () => {
  expect(solver(EXAMPLE1, 1)).toBe(5);
  expect(solver(EXAMPLE2, 2)).toBe(2);
});
