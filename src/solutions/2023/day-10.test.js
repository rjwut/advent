const solver = require('./day-10');

const EXAMPLES = [
  { input: `.....
.S-7.
.|.|.
.L-J.
.....`, output: [ 4, 1 ] },
  { input: `..F7.
.FJ|.
SJ.L7
|F--J
LJ...`, output: [ 8, 1 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 10, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
