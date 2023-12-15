const solver = require('./day-15');

const EXAMPLE = 'rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7';

test('Day 15', () => {
  expect(solver(EXAMPLE)).toEqual([ 1320, 145 ]);
});
