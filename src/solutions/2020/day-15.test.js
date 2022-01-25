const solver = require('./day-15');

const EXAMPLES = [
  { input: '0,3,6', answer:  436 },
  { input: '1,3,2', answer:    1 },
  { input: '2,1,3', answer:   10 },
  { input: '1,2,3', answer:   27 },
  { input: '2,3,1', answer:   78 },
  { input: '3,2,1', answer:  438 },
  { input: '3,1,2', answer: 1836 },
];

test('Day 15', () => {
  EXAMPLES.forEach(example => {
    expect(solver(example.input, 2020)).toBe(example.answer);
  })
});
