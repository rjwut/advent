const solver = require('./day-09');

const EXAMPLES = [
  {
    input: '9 players; last marble is worth 25 points',
    output: 32,
  },
  {
    input: '10 players; last marble is worth 1618 points',
    output: 8317,
  },
  {
    input: '13 players; last marble is worth 7999 points',
    output: 146_373,
  },
  {
    input: '17 players; last marble is worth 1104 points',
    output: 2764,
  },
  {
    input: '21 players; last marble is worth 6111 points',
    output: 54_718,
  },
  {
    input: '30 players; last marble is worth 5807 points',
    output: 37_305,
  },
];

test.each(EXAMPLES)('Day 9', example => {
  expect(solver(example.input, 1)).toEqual(example.output);
});
