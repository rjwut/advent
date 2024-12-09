const solver = require('./day-09');

const EXAMPLE = '2333133121414131402';

test('Day 9', () => {
  expect(solver(EXAMPLE)).toEqual([1928, 2858 ]);
});
