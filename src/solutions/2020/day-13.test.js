const solver = require('./day-13');

const EXAMPLES = [
  '939\n7,13,x,x,59,x,31,19',
  '-1\n17,x,13,19',
  '-1\n67,7,59,61',
  '-1\n67,x,7,59,61',
  '-1\n67,7,x,59,61',
  '-1\n1789,37,47,1889',
];

test('Day 13', () => {
  expect(EXAMPLES.map(solver)).toEqual([
    [ 295, 1068781 ],
    [ undefined, 3417 ],
    [ undefined, 754018 ],
    [ undefined, 779210 ],
    [ undefined, 1261476 ],
    [ undefined, 1202161486 ],
  ]);
});
