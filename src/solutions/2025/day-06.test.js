const solver = require('./day-06');

// Code for single example
const EXAMPLE = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  `;

test('Day 6', () => {
  expect(solver(EXAMPLE)).toEqual([ 4277556, 3263827 ]);
});
