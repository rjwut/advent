const solver = require('./day-01');

const EXAMPLE_1 = `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`;
const EXAMPLE_2 = `two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`;

test('Day 1', () => {
  expect(solver(EXAMPLE_1, 1)).toEqual(142);
  expect(solver(EXAMPLE_2, 2)).toEqual(281);
});
