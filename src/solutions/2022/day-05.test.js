const solver = require('./day-05');

// Can't use a template literal here, or VS Code will trim the lines! 🤦‍♂️
const EXAMPLE = [
  '    [D]    ',
  '[N] [C]    ',
  '[Z] [M] [P]',
  ' 1   2   3 ',
  '',
  'move 1 from 2 to 1',
  'move 3 from 1 to 3',
  'move 2 from 2 to 1',
  'move 1 from 1 to 2',
].join('\n');

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 'CMZ', 'MCD' ]);
});
