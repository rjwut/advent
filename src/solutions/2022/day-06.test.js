const solver = require('./day-06');

const EXAMPLES = [
  { input: 'mjqjpqmgbljsphdztnvjfqwrcgsmlb',    output: [ 7, 19 ] },
  { input: 'bvwbjplbgvbhsrlpgdmjqwftvncz',      output: [ 5, 23 ] },
  { input: 'nppdvjthqldpwncqszvftbrmjlhg',      output: [ 6, 23 ] },
  { input: 'nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', output: [ 10, 29 ] },
  { input: 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw',  output: [ 11, 26 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 6, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
