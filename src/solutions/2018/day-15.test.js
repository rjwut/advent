const solver = require('./day-15');

const EXAMPLES = [
  {
    input: `#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`,
    output: [ 27730, 4988 ],
  },
  {
    input: `#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######`,
    output: [ 36334, 29064 ],
  },
  {
    input: `#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######`,
    output: [ 39514, 31284 ],
  },
  {
    input: `#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######`,
    output: [ 27755, 3478 ],
  },
  {
    input: `#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`,
    output: [ 28944, 6474 ],
  },
  {
    input: `#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`,
    output: [ 18740, 1140 ],
  },
];

test.each(EXAMPLES)('Day 15', example => {
  expect(solver(example.input)).toEqual(example.output);
});
