const solver = require('./day-13');

const EXAMPLES = [
  {
    input: '|\nv\n|\n|\n|\n^\n|',
    output: [ '0,3', undefined ],
  },
  {
    input: `/->-\\        
|   |  /----\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/   `,
    output: [ '7,3', undefined ],
  },
  {
    input: `/>-<\\  
|   |  
| /<+-\\
| | | v
\\>+</ |
  |   ^
  \\<->/`,
    output: [ '2,0', '6,4' ],
  }
];

test.each(EXAMPLES)('Day 13', example => {
  expect(solver(example.input)).toEqual(example.output);
});
