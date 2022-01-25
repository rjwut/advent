const solver = require('./day-02');

const EXAMPLE_1 = `abcdef
bababc
abbcde
abcccd
aabcdd
abcdee
ababab`;
const EXAMPLE_2 = `abcde
fghij
klmno
pqrst
fguij
axcye
wvxyz`;

test('Day 2', () => {
  expect(solver(EXAMPLE_1, 1)).toEqual(12);
  expect(solver(EXAMPLE_2, 2)).toEqual('fgij');
});
