const solver = require('./day-19');

const EXAMPLE = `r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb`;

test('Day 19', () => {
  expect(solver(EXAMPLE)).toEqual([ 6, 16 ]);
});
