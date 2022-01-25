const solver = require('./day-14');

const EXAMPLE = `NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`;

test('Day 14', () => {
  expect(solver(EXAMPLE)).toEqual([ 1588, 2188189693529 ]);
});
