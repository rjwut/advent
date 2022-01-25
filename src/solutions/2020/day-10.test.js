const solver = require('./day-10');

const EXAMPLE1 = `16
10
15
5
1
11
7
19
6
12
4`;
const EXAMPLE2 = `28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3`;

test('Day 10', () => {
  expect(solver(EXAMPLE1)).toEqual([ 35, 8 ]);
  expect(solver(EXAMPLE2)).toEqual([ 220, 19208 ]);
});
