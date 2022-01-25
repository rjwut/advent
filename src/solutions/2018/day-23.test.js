const solver = require('./day-23');

const EXAMPLES = [
  {
    input: `pos=<0,0,0>, r=4
pos=<1,0,0>, r=1
pos=<4,0,0>, r=3
pos=<0,2,0>, r=1
pos=<0,5,0>, r=3
pos=<0,0,3>, r=1
pos=<1,1,1>, r=1
pos=<1,1,2>, r=1
pos=<1,3,1>, r=1`,
    output: [ 7, 1 ],
  },
  {
    input: `pos=<10,12,12>, r=2
pos=<12,14,12>, r=2
pos=<16,12,12>, r=4
pos=<14,14,14>, r=6
pos=<50,50,50>, r=200
pos=<10,10,10>, r=5`,
    output: [ 6, 36 ],
  },
];

test.each(EXAMPLES)('Day 23', example => {
  expect(solver(example.input)).toEqual(example.output);
});
