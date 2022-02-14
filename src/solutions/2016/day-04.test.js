const solver = require('./day-04');

const EXAMPLE = `aaaaa-bbb-z-y-x-123[abxyz]
a-b-c-d-e-f-g-h-987[abcde]
not-a-real-room-404[oarel]
totally-real-room-200[decoy]`;

test('Day 4', () => {
  expect(solver(EXAMPLE)).toEqual([ 1514, undefined ]);
});
