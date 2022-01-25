const solver = require('./day-20');

const EXAMPLES = [
  {
    input: '^WNE$',
    output: 3,
  },
  {
    input: '^ENWWW(NEEE|SSE(EE|N))$',
    output: 10,
  },
  {
    input: '^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$',
    output: 18,
  },
  {
    input: '^ESSWWN(E|NNENN(EESS(WNSE|)SSS|WWWSSSSE(SW|NNNE)))$',
    output: 23,
  },
  {
    input: '^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$',
    output: 31,
  },
];

test.each(EXAMPLES)('Day 20', example => {
  expect(solver(example.input)).toEqual([ example.output, 0 ]);
});
