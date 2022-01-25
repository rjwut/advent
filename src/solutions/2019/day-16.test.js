const solver = require('./day-16');

const PART_1_EXAMPLES = [
  {
    input: '12345678',
    runs: [
      { phases: 1, output: '48226158' },
      { phases: 2, output: '34040438' },
      { phases: 3, output: '03415518' },
      { phases: 4, output: '01029498' },
    ],
  },
  {
    input: '80871224585914546619083218645595',
    runs: [
      { output: '24176176' },
    ],
  },
  {
    input: '19617804207202209144916044189917',
    runs: [
      { output: '73745418' },
    ],
  },
  {
    input: '69317163492948606335995924319873',
    runs: [
      { output: '52432133' },
    ],
  },
];
const PART_2_EXAMPLES = [
  {
    input: `0159992012345678`,
    runs: [
      { phases: 1, output: `65306158` },
      { phases: 2, output: `48300438` },
      { phases: 3, output: `06855518` },
      { phases: 4, output: `88249498` },
    ]
  },
  {
    input: '03036732577212944063491565474664',
    runs: [
      { output: '84462026' },
    ],
  },
  {
    input: '02935109699940807407585447034323',
    runs: [
      { output: '78725270' },
    ],
  },
  {
    input: '03081770884921959731165446850517',
    runs: [
      { output: '53553731' },
    ],
  },
];

describe('Day 16', () => {
  test.each(PART_1_EXAMPLES)('Part 1', example => {
    example.runs.forEach(run => {
      expect(solver(example.input, 1, run.phases || 100)).toEqual(run.output);
    });
  });

  test.each(PART_2_EXAMPLES)('Part 2', example => {
    example.runs.forEach(run => {
      expect(solver(example.input, 2, run.phases || 100)).toEqual(run.output);
    });
  });
});
