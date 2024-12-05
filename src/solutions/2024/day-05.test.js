const solver = require('./day-05');

const EXAMPLE = `47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`;

test('Day 5', () => {
  expect(solver(EXAMPLE)).toEqual([ 143, 123 ]);
});

// Code for multiple examples
/*
const EXAMPLES = [
  { input: '', output: [ undefined, undefined ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 5, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
*/
