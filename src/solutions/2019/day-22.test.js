const solver = require('./day-22');

const CONFIG_PART_1 = { part: 1, deckSize: 10n, cardToFind: 7n };
const CONFIG_PART_2 = { part: 2, deckSize: 10n, iterations: 2n, indexToCheck: 7n };
const EXAMPLES = [
  {
    input: 'deal into new stack',
    output: 2n,
    config: CONFIG_PART_1,
  },
  {
    input: 'cut 3',
    output: 4n,
    config: CONFIG_PART_1,
  },
  {
    input: 'deal with increment 3',
    output: 1n,
    config: CONFIG_PART_1,
  },
  {
    input: `deal with increment 7
deal into new stack
deal into new stack`,
    output: 9n,
    config: CONFIG_PART_1,
  },
  {
    input: `cut 6
deal with increment 7
deal into new stack`,
    output: 2n,
    config: CONFIG_PART_1,
  },
  {
    input: `deal with increment 7
deal with increment 9
cut -2`,
    output: 3n,
    config: CONFIG_PART_1,
  },
  {
    input: `deal into new stack
cut -2
deal with increment 7
cut 8
cut -4
deal with increment 7
cut 3
deal with increment 9
deal with increment 3
cut -1`,
    output: 6n,
    config: CONFIG_PART_1,
  },
  {
    input: `deal into new stack
deal into new stack`,
    output: 7n,
    config: CONFIG_PART_2,
  },
];

EXAMPLES.forEach(({ input, output, config }, i) => {
  test(`Day 22, example ${i}`, () => {
    expect(solver(input, config)).toEqual(output);
  });
});
