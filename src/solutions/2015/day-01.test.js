const solver = require('./day-01');

const EXAMPLES = [
  { input: '(())',    output: [  0, undefined ] },
  { input: '()()',    output: [  0, undefined ] },
  { input: '(((',     output: [  3, undefined ] },
  { input: '(()(()(', output: [  3, undefined ] },
  { input: '))(((((', output: [  3, 1 ] },
  { input: '())',     output: [ -1, 3 ] },
  { input: '))(',     output: [ -1, 1 ] },
  { input: ')))',     output: [ -3, 1 ] },
  { input: ')())())', output: [ -3, 1 ] },
  { input: ')',       output: [ -1, 1 ] },
  { input: '()())',   output: [ -1, 5 ] },
];

test.each(EXAMPLES)('Day 01', ({ input, output }) => {
  expect(solver(input)).toEqual(output);
});
