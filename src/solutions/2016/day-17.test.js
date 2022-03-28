const solver = require('./day-17');

const EXAMPLES = [
  {
    input: 'hijkl',
    output: [ undefined, undefined ],
  },
  {
    input: 'ihgpwlah',
    output: [ 'DDRRRD', 370 ],
  },
  {
    input: 'kglvqrro',
    output: [ 'DDUDRLRRUDRD', 492 ],
  },
  {
    input: 'ulqzkmiv',
    output: [ 'DRURDRUDDLLDLUURRDULRLDUUDDDRR', 830 ],
  },
];

test.each(EXAMPLES)('Day 17', ({ input, output }) => {
  expect(solver(input)).toEqual(output);
});
