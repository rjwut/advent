const solver = require('./day-16');

const EXAMPLE = 's1,x3/4,pe/b';

test('Day 16', () => {
  expect(solver(EXAMPLE, 5)).toEqual([ 'baedc', 'abcde' ]);
});
