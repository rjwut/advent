const solver = require('./day-16');

const EXAMPLE_INSTRUCTION = [
  'Before: [3, 2, 1, 1]',
  '9 2 1 2',
  'After:  [3, 2, 2, 1]',
];

test('Day 16', () => {
  const sample = solver.analyzeSample(EXAMPLE_INSTRUCTION);
  expect(sample).toMatchObject({
    before: [ 3, 2, 1, 1 ],
    instruction: [ 9, 2, 1, 2 ],
    after: [ 3, 2, 2, 1 ],
  });
  expect([ ...sample.analysis.values() ]).toEqual([ 'addi', 'mulr', 'seti' ]);
});
