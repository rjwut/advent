const solver = require('./day-07');

const EXAMPLE = `abba[mnop]qrst
abcd[bddb]xyyx
aaaa[qwer]tyui
ioxxoj[asdfgh]zxcvbn
aba[bab]xyz
xyx[xyx]xyx
aaa[kek]eke
zazbz[bzb]cdb`;

test('Day 7', () => {
  expect(solver(EXAMPLE)).toEqual([ 2, 3 ]);
});
