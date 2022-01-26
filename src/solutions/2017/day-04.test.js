const solver = require('./day-04');

const EXAMPLE = `aa bb cc dd ee
aa bb cc dd aa
aa bb cc dd aaa
abcde fghij
abcde xyz ecdab
a ab abc abd abf abj
iiii oiii ooii oooi oooo
oiii ioii iioi iiio`;

test('Day 4', () => {
  expect(solver(EXAMPLE)).toEqual([ 7, 5 ]);
});
