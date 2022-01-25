const solver = require('./day-11');

const EXAMPLES = [
  {
    serial: '8',
    coords: [ 3, 5 ],
    expected: 4,
  },
  {
    serial: '57',
    coords: [ 122, 79 ],
    expected: -5,
  },
  {
    serial: '39',
    coords: [ 217, 196 ],
    expected: 0,
  },
  {
    serial: '71',
    coords: [ 101, 153 ],
    expected: 4,
  },
  {
    serial: '18',
    coords: [ 33, 45 ],
    size: 3,
    expected: 29,
  },
  {
    serial: '18',
    expected: [ '33,45', '90,269,16' ],
  },
  {
    serial: '42',
    expected: [ '21,61', '232,251,12' ],
  },
];

test.each(EXAMPLES)('Day 11', example => {
  expect(solver(example.serial, example.coords, example.size)).toEqual(example.expected);
});
