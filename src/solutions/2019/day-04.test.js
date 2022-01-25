const solver = require('./day-04');

const EXAMPLES = [
  { range: '1-10',   answer: [  0,  0 ] },
  { range: '7-25',   answer: [  2,  2 ] },
  { range: '99-123', answer: [ 11, 10 ] },
];

test('Day 4', () => {
  EXAMPLES.forEach(example => {
    expect(solver(example.range)).toEqual(example.answer);
  });
});
