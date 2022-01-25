const SummedAreaTable = require('./summed-area-table');

const TABLE = [
  [ 31,  2,  4, 33,  5, 36 ],
  [ 12, 26,  9, 10, 29, 25 ],
  [ 13, 17, 21, 22, 20, 18 ],
  [ 24, 23, 15, 16, 14, 19 ],
  [ 30,  8, 28, 27, 11,  7 ],
  [  1, 35, 34,  3, 32,  6 ],
];

test('Summed area table', () => {
  const sat = new SummedAreaTable(TABLE);
  expect(sat.getSum(3, 2, 3, 2)).toBe(111);
});
