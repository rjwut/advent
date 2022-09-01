const solver = require('./day-12');

const EXAMPLES = [
  { input: '[1,2,3]',                         output: [  6, 6 ] },
  { input: '{"a":2,"b":4}',                   output: [  6, 6 ] },
  { input: '[[[3]]]',                         output: [  3, 3 ] },
  { input: '{"a":{"b":4},"c":-1}',            output: [  3, 3 ] },
  { input: '{"a":[-1,1]}',                    output: [  0, 0 ] },
  { input: '[-1,{"a":1}]',                    output: [  0, 0 ] },
  { input: '[]',                              output: [  0, 0 ] },
  { input: '{}',                              output: [  0, 0 ] },
  { input: '[1,{"c":"red","b":2},3]',         output: [  6, 4 ] },
  { input: '{"d":"red","e":[1,2,3,4],"f":5}', output: [ 15, 0 ] },
  { input: '[1,"red",5]',                     output: [  6, 6 ] },
];

EXAMPLES.forEach(({ input, output }, i) => {
  test(`Day 12, example ${i}`, () => {
    expect(solver(input)).toEqual(output);
  });
});
