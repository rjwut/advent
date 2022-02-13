const solver = require('./day-21');

const EXAMPLE = `../.# => ##./#../...
.#./..#/### => #..#/..../..../#..#`;

test('Day 21', () => {
  expect(solver(EXAMPLE, 2)).toEqual(12);
});
