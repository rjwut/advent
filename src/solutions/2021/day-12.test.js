const solver = require('./day-12');

const EXAMPLES = [
  {
    input: `start-A
start-b
A-c
A-b
b-d
A-end
b-end`,
    output: [ 10, 36 ],
  },
  {
    input: `dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc`,
    output: [ 19, 103 ],
  },
  {
    input: `fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW`,
    output: [ 226, 3509 ],
  }
];

test('Day 12', () => {
  EXAMPLES.forEach(example => {
    expect(solver(example.input)).toEqual(example.output);
  });
});
