const solver = require('./day-12');

const EXAMPLES = [
  {
    input: `<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`,
    steps: 10,
    output: [ 179, 2772 ],
  },
  {
    input: `<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`,
    steps: 100,
    output: [ 1940, 4686774924 ],
  },
];

test('Day 12', () => {
  EXAMPLES.forEach(example => {
    expect(solver(example.input, example.steps)).toEqual(example.output);
  });
});
