const solver = require('./day-08');

const EXAMPLE_1 = '123456789012';
const EXAMPLE_2 = '0222112222120000';

xtest('Day 8', () => {
  expect(solver(EXAMPLE_1, 1, 3, 2)).toEqual(1);
  expect(solver(EXAMPLE_2, 2, 2, 2)).toEqual('# \n #');
});
